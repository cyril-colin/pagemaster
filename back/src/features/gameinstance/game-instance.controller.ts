import { Request } from 'express';
import { SocketServerService } from 'src/core/socket.service';
import { Item } from 'src/pagemaster-schemas/src/items.types';
import { LoggerService } from '../../core/logger.service';
import { Delete, Get, Patch, Post, Put } from '../../core/router/controller.decorators';
import { HttpBadRequestError, HttpForbiddenError, HttpNotFoundError } from '../../core/router/http-errors';
import { HEADER_CURRENT_PARTICIPANT } from '../../pagemaster-schemas/src/constants';
import { Character, GameInstance, Participant } from '../../pagemaster-schemas/src/pagemaster.types';
import { GameInstanceMongoClient } from './game-instance.mongo-client';

export class GameInstanceController {
  constructor(
    private mongoClient: GameInstanceMongoClient,
    private socketServerService: SocketServerService,
    private logger: LoggerService,
  ) {}

  @Get('/game-instances')
  public async getAllGameInstances(): Promise<GameInstance[]> {
    const gameInstanceDocuments = await this.mongoClient.getAllGameInstances();
    
    // Convert MongoDB documents to plain GameInstance objects (remove MongoDB _id field)
    return gameInstanceDocuments.map(doc => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, ...gameInstance } = doc;
      return gameInstance as GameInstance;
    });
  }

  @Get('/game-instances/:id')
  public async getGameInstanceById(body: unknown, params: {id: string}): Promise<GameInstance | null> {
    const doc = await this.mongoClient.findGameInstanceById(params.id);
    if (!doc) return null;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...gameInstance } = doc;
    return gameInstance as GameInstance;
  }

  @Get('/game-instances/:id')
  public async getGameInstancesByGameDefId(body: unknown, params: {id: string}): Promise<GameInstance[]> {
    const gameInstanceDocuments = await this.mongoClient.findGameInstancesByGameDefId(params.id);
    // Convert MongoDB documents to plain GameInstance objects (remove MongoDB _id field)
    return gameInstanceDocuments.map(doc => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, ...gameInstance } = doc;
      return gameInstance as GameInstance;
    });
  }

  @Post('/game-instances')
  public async createGameInstance(gameInstance: GameInstance): Promise<GameInstance> {
    const doc = await this.mongoClient.createGameInstance(gameInstance);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...createdGameInstance } = doc;
    
    return createdGameInstance as GameInstance;
  }

  @Post('/game-instances/:gameInstanceId/items')
  public async createGameInstanceItem(
    item: Item,
    params: {gameInstanceId: string},
    query: unknown,
    req: Request,
  ): Promise<GameInstance> {
    const { gameInstance, currentParticipant } = await this.validateContext(params.gameInstanceId, req, 'gameMaster');

    gameInstance.gameDef.possibleItems = gameInstance.gameDef.possibleItems || [];
    gameInstance.gameDef.possibleItems = [...gameInstance.gameDef.possibleItems, item];
    const gameInstanceCleaned = await this.commitGameInstance(gameInstance);

    const updatedParticipant = this.getParticipant(currentParticipant.id, gameInstanceCleaned);
    if (!updatedParticipant) {
      throw new HttpForbiddenError('Forbidden: You are no longer a participant of this game instance');
    }
    
    this.socketServerService.notifyGameInstanceUpdate({
      gameInstance: gameInstanceCleaned,
      by: updatedParticipant,
      event: {
        type: 'item-created',
        title: 'New item added',
        description: `${currentParticipant.name} added a new item: ${item.name}`,
        metadata: { itemId: item.id, itemName: item.name, itemWeight: item.weight }
      }
    });
    
    return gameInstanceCleaned;
  }

  @Put('/game-instances/:id')
  public async updateGameInstance(
    newGameInstance: GameInstance,
    params: {id: string},
    query: unknown,
    req: Request,
  ): Promise<GameInstance> {
    const { currentParticipant } = await this.validateContext(params.id, req, 'player');
    const gameInstanceCleaned = await this.commitGameInstance(newGameInstance);

    const updatedParticipant = this.getParticipant(currentParticipant.id, gameInstanceCleaned);
    if (!updatedParticipant) {
      throw new HttpForbiddenError('Forbidden: You are no longer a participant of this game instance');
    }
    
    this.socketServerService.notifyGameInstanceUpdate({
      gameInstance: gameInstanceCleaned,
      by: updatedParticipant,
      event: {
        type: 'game-instance-updated',
        title: 'Game instance updated',
        description: `${currentParticipant.name} updated the game instance`,
        metadata: { version: gameInstanceCleaned.version }
      }
    });
    
    return gameInstanceCleaned;
  }

  @Put('/game-instances/:gameInstanceId/participants/:participantId')
  public async updateParticipant(
    participant: Participant,
    params: {gameInstanceId: string, participantId: string},
    query: unknown,
    req: Request,
  ): Promise<GameInstance> {
    const { gameInstance, currentParticipant } = await this.validateContext(params.gameInstanceId, req, 'player');
    if ((currentParticipant.id !== params.participantId && currentParticipant.type !== 'gameMaster')) {
      throw new HttpForbiddenError('Forbidden: You can only update your own participant data');
    }

    const participantIndex = gameInstance.participants.findIndex(p => p.id === params.participantId);
    if (participantIndex === -1) {
      throw new HttpBadRequestError('Participant not found in the specified game instance');
    }

    const oldParticipant = gameInstance.participants[participantIndex];
    gameInstance.participants[participantIndex] = participant;

    const gameInstanceCleaned = await this.commitGameInstance(gameInstance);

    const updatedParticipant = this.getParticipant(currentParticipant.id, gameInstanceCleaned);
    if (!updatedParticipant) {
      throw new HttpForbiddenError('Forbidden: You are no longer a participant of this game instance');
    }
    
    this.socketServerService.notifyGameInstanceUpdate({
      gameInstance: gameInstanceCleaned,
      by: updatedParticipant,
      event: {
        type: 'participant-updated',
        title: 'Participant updated',
        description: `${currentParticipant.name} updated participant: ${participant.name}`,
        metadata: { 
          updatedParticipantId: participant.id,
          updatedParticipantName: participant.name,
          updatedByGameMaster: currentParticipant.type === 'gameMaster' && currentParticipant.id !== participant.id,
          oldName: oldParticipant.name
        }
      }
    });
    
    return gameInstanceCleaned;
  }


  @Patch('/game-instances/:gameInstanceId/participants/:participantId/rename')
  public async renameParticipant(
    character: Pick<Character, 'name'>,
    params: {gameInstanceId: string, participantId: string},
    query: unknown,
    req: Request,
  ): Promise<GameInstance> {
    const { gameInstance, currentParticipant } = await this.validateContext(params.gameInstanceId, req, 'player');
    if ((currentParticipant.id !== params.participantId && currentParticipant.type !== 'gameMaster')) {
      throw new HttpForbiddenError('Forbidden: You can only update your own participant data');
    }

    const participantIndex = gameInstance.participants.findIndex(p => p.id === params.participantId);
    if (participantIndex === -1) {
      throw new HttpBadRequestError('Participant not found in the specified game instance');
    }

    const player = gameInstance.participants[participantIndex];
    if (player.type !== 'player') {
      throw new HttpForbiddenError('Forbidden: Only players can be renamed');
    }
    const oldName = player.character.name;
    player.character.name = character.name;

    const gameInstanceCleaned = await this.commitGameInstance(gameInstance);

    const updatedParticipant = this.getParticipant(currentParticipant.id, gameInstanceCleaned);
    if (!updatedParticipant) {
      throw new HttpForbiddenError('Forbidden: You are no longer a participant of this game instance');
    }
    
    this.socketServerService.notifyGameInstanceUpdate({
      gameInstance: gameInstanceCleaned,
      by: updatedParticipant,
      event: {
        type: 'participant-rename',
        title: 'Participant Rename',
        description: `${currentParticipant.name} renamed participant : ${oldName} => ${character.name}`,
      }
    });
    
    return gameInstanceCleaned;
  }

  @Patch('/game-instances/:gameInstanceId/participants/:participantId/avatar')
  public async updateParticipantAvatar(
    character: Pick<Character, 'picture'>,
    params: {gameInstanceId: string, participantId: string},
    query: unknown,
    req: Request,
  ): Promise<GameInstance> {
    const { gameInstance, currentParticipant } = await this.validateContext(params.gameInstanceId, req, 'player');
    if ((currentParticipant.id !== params.participantId && currentParticipant.type !== 'gameMaster')) {
      throw new HttpForbiddenError('Forbidden: You can only update your own participant data');
    }

    const participantIndex = gameInstance.participants.findIndex(p => p.id === params.participantId);
    if (participantIndex === -1) {
      throw new HttpBadRequestError('Participant not found in the specified game instance');
    }

    const player = gameInstance.participants[participantIndex];
    if (player.type !== 'player') {
      throw new HttpForbiddenError('Forbidden: Only players can have their avatar updated');
    }
    player.character.picture = character.picture;

    const gameInstanceCleaned = await this.commitGameInstance(gameInstance);

    const updatedParticipant = this.getParticipant(currentParticipant.id, gameInstanceCleaned);
    if (!updatedParticipant) {
      throw new HttpForbiddenError('Forbidden: You are no longer a participant of this game instance');
    }
    
    this.socketServerService.notifyGameInstanceUpdate({
      gameInstance: gameInstanceCleaned,
      by: updatedParticipant,
      event: {
        type: 'participant-avatar-update',
        title: 'Avatar Updated',
        description: `${currentParticipant.name} updated avatar of ${player.character.name}`,
      }
    });
    
    return gameInstanceCleaned;
  }

  @Patch('/game-instances/:gameInstanceId/participants/:participantId/description')
  public async updateParticipantDescription(
    character: Pick<Character, 'description'>,
    params: {gameInstanceId: string, participantId: string},
    query: unknown,
    req: Request,
  ): Promise<GameInstance> {
    const { gameInstance, currentParticipant } = await this.validateContext(params.gameInstanceId, req, 'player');
    if ((currentParticipant.id !== params.participantId && currentParticipant.type !== 'gameMaster')) {
      throw new HttpForbiddenError('Forbidden: You can only update your own participant data');
    }

    const participantIndex = gameInstance.participants.findIndex(p => p.id === params.participantId);
    if (participantIndex === -1) {
      throw new HttpBadRequestError('Participant not found in the specified game instance');
    }

    const player = gameInstance.participants[participantIndex];
    if (player.type !== 'player') {
      throw new HttpForbiddenError('Forbidden: Only players can have their description updated');
    }
    player.character.description = character.description;

    const gameInstanceCleaned = await this.commitGameInstance(gameInstance);

    const updatedParticipant = this.getParticipant(currentParticipant.id, gameInstanceCleaned);
    if (!updatedParticipant) {
      throw new HttpForbiddenError('Forbidden: You are no longer a participant of this game instance');
    }
    
    this.socketServerService.notifyGameInstanceUpdate({
      gameInstance: gameInstanceCleaned,
      by: updatedParticipant,
      event: {
        type: 'participant-description-update',
        title: 'Description Updated',
        description: `${currentParticipant.name} updated description of ${player.character.name}`,
      }
    });
    
    return gameInstanceCleaned;
  }

  @Patch('/game-instances/:gameInstanceId/participants/:participantId/bars')
  public async updateParticipantBars(
    attributes: Pick<Character['attributes'], 'bar'>,
    params: {gameInstanceId: string, participantId: string},
    query: unknown,
    req: Request,
  ): Promise<GameInstance> {
    const { gameInstance, currentParticipant } = await this.validateContext(params.gameInstanceId, req, 'player');
    if ((currentParticipant.id !== params.participantId && currentParticipant.type !== 'gameMaster')) {
      throw new HttpForbiddenError('Forbidden: You can only update your own participant data');
    }

    const participantIndex = gameInstance.participants.findIndex(p => p.id === params.participantId);
    if (participantIndex === -1) {
      throw new HttpBadRequestError('Participant not found in the specified game instance');
    }

    const player = gameInstance.participants[participantIndex];
    if (player.type !== 'player') {
      throw new HttpForbiddenError('Forbidden: Only players can have their bars updated');
    }
    player.character.attributes.bar = attributes.bar;

    const gameInstanceCleaned = await this.commitGameInstance(gameInstance);

    const updatedParticipant = this.getParticipant(currentParticipant.id, gameInstanceCleaned);
    if (!updatedParticipant) {
      throw new HttpForbiddenError('Forbidden: You are no longer a participant of this game instance');
    }
    
    this.socketServerService.notifyGameInstanceUpdate({
      gameInstance: gameInstanceCleaned,
      by: updatedParticipant,
      event: {
        type: 'participant-bars-update',
        title: 'Bars Updated',
        description: `${currentParticipant.name} updated bars of ${player.character.name}`,
      }
    });
    
    return gameInstanceCleaned;
  }

  @Patch('/game-instances/:gameInstanceId/participants/:participantId/statuses')
  public async updateParticipantStatuses(
    attributes: Pick<Character['attributes'], 'status'>,
    params: {gameInstanceId: string, participantId: string},
    query: unknown,
    req: Request,
  ): Promise<GameInstance> {
    const { gameInstance, currentParticipant } = await this.validateContext(params.gameInstanceId, req, 'player');
    if ((currentParticipant.id !== params.participantId && currentParticipant.type !== 'gameMaster')) {
      throw new HttpForbiddenError('Forbidden: You can only update your own participant data');
    }

    const participantIndex = gameInstance.participants.findIndex(p => p.id === params.participantId);
    if (participantIndex === -1) {
      throw new HttpBadRequestError('Participant not found in the specified game instance');
    }

    const player = gameInstance.participants[participantIndex];
    if (player.type !== 'player') {
      throw new HttpForbiddenError('Forbidden: Only players can have their statuses updated');
    }
    player.character.attributes.status = attributes.status;

    const gameInstanceCleaned = await this.commitGameInstance(gameInstance);

    const updatedParticipant = this.getParticipant(currentParticipant.id, gameInstanceCleaned);
    if (!updatedParticipant) {
      throw new HttpForbiddenError('Forbidden: You are no longer a participant of this game instance');
    }
    
    this.socketServerService.notifyGameInstanceUpdate({
      gameInstance: gameInstanceCleaned,
      by: updatedParticipant,
      event: {
        type: 'participant-statuses-update',
        title: 'Statuses Updated',
        description: `${currentParticipant.name} updated statuses of ${player.character.name}`,
      }
    });
    
    return gameInstanceCleaned;
  }

  @Patch('/game-instances/:gameInstanceId/participants/:participantId/strengths')
  public async updateParticipantStrengths(
    attributes: Pick<Character['attributes'], 'strength'>,
    params: {gameInstanceId: string, participantId: string},
    query: unknown,
    req: Request,
  ): Promise<GameInstance> {
    const { gameInstance, currentParticipant } = await this.validateContext(params.gameInstanceId, req, 'player');
    if ((currentParticipant.id !== params.participantId && currentParticipant.type !== 'gameMaster')) {
      throw new HttpForbiddenError('Forbidden: You can only update your own participant data');
    }

    const participantIndex = gameInstance.participants.findIndex(p => p.id === params.participantId);
    if (participantIndex === -1) {
      throw new HttpBadRequestError('Participant not found in the specified game instance');
    }

    const player = gameInstance.participants[participantIndex];
    if (player.type !== 'player') {
      throw new HttpForbiddenError('Forbidden: Only players can have their strengths updated');
    }
    player.character.attributes.strength = attributes.strength;

    const gameInstanceCleaned = await this.commitGameInstance(gameInstance);

    const updatedParticipant = this.getParticipant(currentParticipant.id, gameInstanceCleaned);
    if (!updatedParticipant) {
      throw new HttpForbiddenError('Forbidden: You are no longer a participant of this game instance');
    }
    
    this.socketServerService.notifyGameInstanceUpdate({
      gameInstance: gameInstanceCleaned,
      by: updatedParticipant,
      event: {
        type: 'participant-strengths-update',
        title: 'Strengths Updated',
        description: `${currentParticipant.name} updated strengths of ${player.character.name}`,
      }
    });
    
    return gameInstanceCleaned;
  }

  @Patch('/game-instances/:gameInstanceId/participants/:participantId/weaknesses')
  public async updateParticipantWeaknesses(
    attributes: Pick<Character['attributes'], 'weakness'>,
    params: {gameInstanceId: string, participantId: string},
    query: unknown,
    req: Request,
  ): Promise<GameInstance> {
    const { gameInstance, currentParticipant } = await this.validateContext(params.gameInstanceId, req, 'player');
    if ((currentParticipant.id !== params.participantId && currentParticipant.type !== 'gameMaster')) {
      throw new HttpForbiddenError('Forbidden: You can only update your own participant data');
    }

    const participantIndex = gameInstance.participants.findIndex(p => p.id === params.participantId);
    if (participantIndex === -1) {
      throw new HttpBadRequestError('Participant not found in the specified game instance');
    }

    const player = gameInstance.participants[participantIndex];
    if (player.type !== 'player') {
      throw new HttpForbiddenError('Forbidden: Only players can have their weaknesses updated');
    }
    player.character.attributes.weakness = attributes.weakness;

    const gameInstanceCleaned = await this.commitGameInstance(gameInstance);

    const updatedParticipant = this.getParticipant(currentParticipant.id, gameInstanceCleaned);
    if (!updatedParticipant) {
      throw new HttpForbiddenError('Forbidden: You are no longer a participant of this game instance');
    }
    
    this.socketServerService.notifyGameInstanceUpdate({
      gameInstance: gameInstanceCleaned,
      by: updatedParticipant,
      event: {
        type: 'participant-weaknesses-update',
        title: 'Weaknesses Updated',
        description: `${currentParticipant.name} updated weaknesses of ${player.character.name}`,
      }
    });
    
    return gameInstanceCleaned;
  }

  @Patch('/game-instances/:gameInstanceId/participants/:participantId/skills')
  public async updateParticipantSkills(
    character: Pick<Character, 'skills'>,
    params: {gameInstanceId: string, participantId: string},
    query: unknown,
    req: Request,
  ): Promise<GameInstance> {
    const { gameInstance, currentParticipant } = await this.validateContext(params.gameInstanceId, req, 'player');
    if ((currentParticipant.id !== params.participantId && currentParticipant.type !== 'gameMaster')) {
      throw new HttpForbiddenError('Forbidden: You can only update your own participant data');
    }

    const participantIndex = gameInstance.participants.findIndex(p => p.id === params.participantId);
    if (participantIndex === -1) {
      throw new HttpBadRequestError('Participant not found in the specified game instance');
    }

    const player = gameInstance.participants[participantIndex];
    if (player.type !== 'player') {
      throw new HttpForbiddenError('Forbidden: Only players can have their skills updated');
    }
    player.character.skills = character.skills;

    const gameInstanceCleaned = await this.commitGameInstance(gameInstance);

    const updatedParticipant = this.getParticipant(currentParticipant.id, gameInstanceCleaned);
    if (!updatedParticipant) {
      throw new HttpForbiddenError('Forbidden: You are no longer a participant of this game instance');
    }
    
    this.socketServerService.notifyGameInstanceUpdate({
      gameInstance: gameInstanceCleaned,
      by: updatedParticipant,
      event: {
        type: 'participant-skills-update',
        title: 'Skills Updated',
        description: `${currentParticipant.name} updated skills of ${player.character.name}`,
      }
    });
    
    return gameInstanceCleaned;
  }

  @Delete('/game-instances/:id')
  public async deleteGameInstance(body: unknown, params: {id: string}): Promise<boolean> {
    return await this.mongoClient.deleteGameInstance(params.id);
  }

  private async validateContext(
    gameInstanceId: string,
    req: Request,
    requiredRole: Participant['type'],
  ): Promise<{gameInstance: GameInstance, currentParticipant: Participant}> {
    if (!gameInstanceId) {
      throw new HttpBadRequestError('Missing gameInstanceId parameter');
    }
    const gameInstance = await this.mongoClient.findGameInstanceById(gameInstanceId);
    if (!gameInstance) {
      throw new HttpNotFoundError('Game instance not found');
    }

    const currentParticipantId = (Array.isArray(req.headers[HEADER_CURRENT_PARTICIPANT]) ? null : req.headers[HEADER_CURRENT_PARTICIPANT]) || null;
    const currentParticipant = this.getParticipant(currentParticipantId, gameInstance);
    if (requiredRole === 'gameMaster' && currentParticipant?.type !== 'gameMaster') {
      throw new HttpForbiddenError('Forbidden: You need to be a game master');
    }
    if (!currentParticipant) {
      throw new HttpForbiddenError('Forbidden: You need to be a player');
    }

    return { gameInstance, currentParticipant };
  }
  private async commitGameInstance(gameInstance: GameInstance): Promise<GameInstance> {
    gameInstance.version = (gameInstance.version || 0) + 1;
    const updated = await this.mongoClient.updateGameInstance(gameInstance.id, gameInstance.version -1, gameInstance);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...gameInstanceCleaned } = updated as GameInstance & {_id: unknown};
    return gameInstanceCleaned;
  }

  
  private getParticipant(participantId: Participant['id'] |null, gameInstance: GameInstance): Participant | null {
    const currentParticipant = gameInstance.participants.find(p => p.id === participantId);
    return currentParticipant || null;
  }
}
