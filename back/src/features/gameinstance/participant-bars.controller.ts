import { Request } from 'express';
import { Delete, Patch, Post, Put } from '../../core/router/controller.decorators';
import { HttpForbiddenError } from '../../core/router/http-errors';
import { AttributeBar } from '../../pagemaster-schemas/src/attributes.types';
import { Character, GameInstance } from '../../pagemaster-schemas/src/pagemaster.types';
import { GameInstanceService } from './game-instance.service';

export class ParticipantBarsController {
  constructor(private gameInstanceService: GameInstanceService) {}

  @Patch('/game-instances/:gameInstanceId/participants/:participantId/bars')
  public async updateParticipantBars(
    attributes: Pick<Character['attributes'], 'bar'>,
    params: {gameInstanceId: string, participantId: string},
    query: unknown,
    req: Request,
  ): Promise<GameInstance> {
    const { gameInstance, currentParticipant } = await this.gameInstanceService.validateContext(params.gameInstanceId, req, 'player');
    this.gameInstanceService.validateParticipantPermission(currentParticipant, params.participantId);

    const participantIndex = this.gameInstanceService.findParticipantIndex(gameInstance, params.participantId);
    const player = gameInstance.participants[participantIndex];
    this.gameInstanceService.validatePlayerType(player);

    player.character.attributes.bar = attributes.bar;

    const gameInstanceCleaned = await this.gameInstanceService.commitGameInstance(gameInstance);

    const updatedParticipant = this.gameInstanceService.getParticipant(currentParticipant.id, gameInstanceCleaned);
    if (!updatedParticipant) {
      throw new HttpForbiddenError('Forbidden: You are no longer a participant of this game instance');
    }
    
    this.gameInstanceService.notifyGameInstanceUpdate({
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

  @Post('/game-instances/:gameInstanceId/participants/:participantId/bars')
  public async addParticipantBar(
    bar: AttributeBar,
    params: {gameInstanceId: string, participantId: string},
    query: unknown,
    req: Request,
  ): Promise<GameInstance> {
    const { gameInstance, currentParticipant } = await this.gameInstanceService.validateContext(params.gameInstanceId, req, 'player');
    this.gameInstanceService.validateParticipantPermission(currentParticipant, params.participantId);

    const participantIndex = this.gameInstanceService.findParticipantIndex(gameInstance, params.participantId);
    const player = gameInstance.participants[participantIndex];
    this.gameInstanceService.validatePlayerType(player);

    // Add the new bar
    bar.id = `bar-${bar.name}-${Date.now()}`;
    player.character.attributes.bar.push(bar);

    const gameInstanceCleaned = await this.gameInstanceService.commitGameInstance(gameInstance);

    const updatedParticipant = this.gameInstanceService.getParticipant(currentParticipant.id, gameInstanceCleaned);
    if (!updatedParticipant) {
      throw new HttpForbiddenError('Forbidden: You are no longer a participant of this game instance');
    }
    
    this.gameInstanceService.notifyGameInstanceUpdate({
      gameInstance: gameInstanceCleaned,
      by: updatedParticipant,
      event: {
        type: 'participant-bar-add',
        title: 'Bar Added',
        description: `${currentParticipant.name} added bar "${bar.name}" to ${player.character.name}`,
      }
    });
    
    return gameInstanceCleaned;
  }

  @Put('/game-instances/:gameInstanceId/participants/:participantId/bars/:barId')
  public async updateParticipantBar(
    bar: AttributeBar,
    params: {gameInstanceId: string, participantId: string, barId: string},
    query: unknown,
    req: Request,
  ): Promise<GameInstance> {
    const { gameInstance, currentParticipant } = await this.gameInstanceService.validateContext(params.gameInstanceId, req, 'player');
    this.gameInstanceService.validateParticipantPermission(currentParticipant, params.participantId);

    const participantIndex = this.gameInstanceService.findParticipantIndex(gameInstance, params.participantId);
    const player = gameInstance.participants[participantIndex];
    this.gameInstanceService.validatePlayerType(player);

    // Find and update the bar
    const barIndex = player.character.attributes.bar.findIndex(b => b.id === params.barId);
    if (barIndex === -1) {
      throw new HttpForbiddenError(`Bar with id ${params.barId} not found`);
    }

    player.character.attributes.bar[barIndex] = bar;

    const gameInstanceCleaned = await this.gameInstanceService.commitGameInstance(gameInstance);

    const updatedParticipant = this.gameInstanceService.getParticipant(currentParticipant.id, gameInstanceCleaned);
    if (!updatedParticipant) {
      throw new HttpForbiddenError('Forbidden: You are no longer a participant of this game instance');
    }
    
    this.gameInstanceService.notifyGameInstanceUpdate({
      gameInstance: gameInstanceCleaned,
      by: updatedParticipant,
      event: {
        type: 'participant-bar-update',
        title: 'Bar Updated',
        description: `${currentParticipant.name} updated bar "${bar.name}" for ${player.character.name}`,
      }
    });
    
    return gameInstanceCleaned;
  }

  @Delete('/game-instances/:gameInstanceId/participants/:participantId/bars/:barId')
  public async deleteParticipantBar(
    body: unknown,
    params: {gameInstanceId: string, participantId: string, barId: string},
    query: unknown,
    req: Request,
  ): Promise<GameInstance> {
    const { gameInstance, currentParticipant } = await this.gameInstanceService.validateContext(params.gameInstanceId, req, 'player');
    this.gameInstanceService.validateParticipantPermission(currentParticipant, params.participantId);

    const participantIndex = this.gameInstanceService.findParticipantIndex(gameInstance, params.participantId);
    const player = gameInstance.participants[participantIndex];
    this.gameInstanceService.validatePlayerType(player);

    // Find and remove the bar
    const barIndex = player.character.attributes.bar.findIndex(b => b.id === params.barId);
    if (barIndex === -1) {
      throw new HttpForbiddenError(`Bar with id ${params.barId} not found`);
    }

    const deletedBar = player.character.attributes.bar[barIndex];
    player.character.attributes.bar.splice(barIndex, 1);

    const gameInstanceCleaned = await this.gameInstanceService.commitGameInstance(gameInstance);

    const updatedParticipant = this.gameInstanceService.getParticipant(currentParticipant.id, gameInstanceCleaned);
    if (!updatedParticipant) {
      throw new HttpForbiddenError('Forbidden: You are no longer a participant of this game instance');
    }
    
    this.gameInstanceService.notifyGameInstanceUpdate({
      gameInstance: gameInstanceCleaned,
      by: updatedParticipant,
      event: {
        type: 'participant-bar-delete',
        title: 'Bar Deleted',
        description: `${currentParticipant.name} deleted bar "${deletedBar.name}" from ${player.character.name}`,
      }
    });
    
    return gameInstanceCleaned;
  }
}
