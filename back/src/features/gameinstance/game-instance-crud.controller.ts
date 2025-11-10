import { Request } from 'express';
import { LoggerService } from '../../core/logger.service';
import { Delete, Get, Post, Put } from '../../core/router/controller.decorators';
import { HttpForbiddenError } from '../../core/router/http-errors';
import { SocketServerService } from '../../core/socket.service';
import { Item } from '../../pagemaster-schemas/src/items.types';
import { GameInstance, Participant } from '../../pagemaster-schemas/src/pagemaster.types';
import { GameInstanceMongoClient } from './game-instance.mongo-client';
import { GameInstanceService } from './game-instance.service';

export class GameInstanceController {
  private gameInstanceService: GameInstanceService;

  constructor(
    private mongoClient: GameInstanceMongoClient,
    socketServerService: SocketServerService,
    private logger: LoggerService,
  ) {
    this.gameInstanceService = new GameInstanceService(mongoClient, socketServerService);
  }

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
    const { gameInstance, currentParticipant } = await this.gameInstanceService.validateContext(params.gameInstanceId, req, 'gameMaster');

    gameInstance.gameDef.possibleItems = gameInstance.gameDef.possibleItems || [];
    gameInstance.gameDef.possibleItems = [...gameInstance.gameDef.possibleItems, item];
    const gameInstanceCleaned = await this.gameInstanceService.commitGameInstance(gameInstance);

    const updatedParticipant = this.gameInstanceService.getParticipant(currentParticipant.id, gameInstanceCleaned);
    if (!updatedParticipant) {
      throw new HttpForbiddenError('Forbidden: You are no longer a participant of this game instance');
    }
    
    this.gameInstanceService.notifyGameInstanceUpdate({
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

  @Post('/game-instances/:gameInstanceId/participants')
  public async addParticipant(
    participant: Participant,
    params: {gameInstanceId: string},
    query: unknown,
    req: Request,
  ): Promise<GameInstance> {
    const { gameInstance, currentParticipant } = await this.gameInstanceService.validateContext(params.gameInstanceId, req, 'gameMaster');

    // Add the new participant to the game instance
    gameInstance.participants = gameInstance.participants || [];
    gameInstance.participants.push(participant);

    const gameInstanceCleaned = await this.gameInstanceService.commitGameInstance(gameInstance);

    const updatedParticipant = this.gameInstanceService.getParticipant(currentParticipant.id, gameInstanceCleaned);
    if (!updatedParticipant) {
      throw new HttpForbiddenError('Forbidden: You are no longer a participant of this game instance');
    }
    
    this.gameInstanceService.notifyGameInstanceUpdate({
      gameInstance: gameInstanceCleaned,
      by: updatedParticipant,
      event: {
        type: 'participant-added',
        title: 'New participant added',
        description: `${currentParticipant.name} added a new participant: ${participant.name}`,
        metadata: { 
          participantId: participant.id,
          participantName: participant.name,
          participantType: participant.type
        }
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
    const { currentParticipant } = await this.gameInstanceService.validateContext(params.id, req, 'player');
    const gameInstanceCleaned = await this.gameInstanceService.commitGameInstance(newGameInstance);

    const updatedParticipant = this.gameInstanceService.getParticipant(currentParticipant.id, gameInstanceCleaned);
    if (!updatedParticipant) {
      throw new HttpForbiddenError('Forbidden: You are no longer a participant of this game instance');
    }
    
    this.gameInstanceService.notifyGameInstanceUpdate({
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
    const { gameInstance, currentParticipant } = await this.gameInstanceService.validateContext(params.gameInstanceId, req, 'player');
    this.gameInstanceService.validateParticipantPermission(currentParticipant, params.participantId);

    const participantIndex = this.gameInstanceService.findParticipantIndex(gameInstance, params.participantId);
    const oldParticipant = gameInstance.participants[participantIndex];
    gameInstance.participants[participantIndex] = participant;

    const gameInstanceCleaned = await this.gameInstanceService.commitGameInstance(gameInstance);

    const updatedParticipant = this.gameInstanceService.getParticipant(currentParticipant.id, gameInstanceCleaned);
    if (!updatedParticipant) {
      throw new HttpForbiddenError('Forbidden: You are no longer a participant of this game instance');
    }
    
    this.gameInstanceService.notifyGameInstanceUpdate({
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

  @Delete('/game-instances/:gameInstanceId/participants/:participantId')
  public async deleteParticipant(
    body: unknown,
    params: {gameInstanceId: string, participantId: string},
    query: unknown,
    req: Request,
  ): Promise<GameInstance> {
    const { gameInstance, currentParticipant } = await this.gameInstanceService.validateContext(params.gameInstanceId, req, 'gameMaster');

    const participantIndex = this.gameInstanceService.findParticipantIndex(gameInstance, params.participantId);
    const deletedParticipant = gameInstance.participants[participantIndex];
    
    // Remove the participant from the array
    gameInstance.participants.splice(participantIndex, 1);

    const gameInstanceCleaned = await this.gameInstanceService.commitGameInstance(gameInstance);

    const updatedParticipant = this.gameInstanceService.getParticipant(currentParticipant.id, gameInstanceCleaned);
    if (!updatedParticipant) {
      throw new HttpForbiddenError('Forbidden: You are no longer a participant of this game instance');
    }
    
    this.gameInstanceService.notifyGameInstanceUpdate({
      gameInstance: gameInstanceCleaned,
      by: updatedParticipant,
      event: {
        type: 'participant-deleted',
        title: 'Participant removed',
        description: `${currentParticipant.name} removed participant: ${deletedParticipant.name}`,
        metadata: { 
          deletedParticipantId: deletedParticipant.id,
          deletedParticipantName: deletedParticipant.name,
        }
      }
    });
    
    return gameInstanceCleaned;
  }

  @Delete('/game-instances/:id')
  public async deleteGameInstance(body: unknown, params: {id: string}): Promise<boolean> {
    return await this.mongoClient.deleteGameInstance(params.id);
  }
}
