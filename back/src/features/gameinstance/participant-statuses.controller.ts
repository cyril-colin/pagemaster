import { Request } from 'express';
import { Delete, Patch, Post, Put } from '../../core/router/controller.decorators';
import { HttpForbiddenError } from '../../core/router/http-errors';
import { AttributeStatus } from '../../pagemaster-schemas/src/attributes.types';
import { Character, GameInstance } from '../../pagemaster-schemas/src/pagemaster.types';
import { GameInstanceService } from './game-instance.service';

export class ParticipantStatusesController {
  constructor(private gameInstanceService: GameInstanceService) {}

  @Patch('/game-instances/:gameInstanceId/participants/:participantId/statuses')
  public async updateParticipantStatuses(
    attributes: Pick<Character['attributes'], 'status'>,
    params: {gameInstanceId: string, participantId: string},
    query: unknown,
    req: Request,
  ): Promise<GameInstance> {
    const { gameInstance, currentParticipant } = await this.gameInstanceService.validateContext(params.gameInstanceId, req, 'player');
    this.gameInstanceService.validateParticipantPermission(currentParticipant, params.participantId);

    const participantIndex = this.gameInstanceService.findParticipantIndex(gameInstance, params.participantId);
    const player = gameInstance.participants[participantIndex];
    this.gameInstanceService.validatePlayerType(player);

    player.character.attributes.status = attributes.status;

    const gameInstanceCleaned = await this.gameInstanceService.commitGameInstance(gameInstance);

    const updatedParticipant = this.gameInstanceService.getParticipant(currentParticipant.id, gameInstanceCleaned);
    if (!updatedParticipant) {
      throw new HttpForbiddenError('Forbidden: You are no longer a participant of this game instance');
    }
    
    this.gameInstanceService.notifyGameInstanceUpdate({
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

  @Post('/game-instances/:gameInstanceId/participants/:participantId/statuses')
  public async addParticipantStatus(
    status: AttributeStatus,
    params: {gameInstanceId: string, participantId: string},
    query: unknown,
    req: Request,
  ): Promise<GameInstance> {
    const { gameInstance, currentParticipant } = await this.gameInstanceService.validateContext(params.gameInstanceId, req, 'player');
    this.gameInstanceService.validateParticipantPermission(currentParticipant, params.participantId);

    const participantIndex = this.gameInstanceService.findParticipantIndex(gameInstance, params.participantId);
    const player = gameInstance.participants[participantIndex];
    this.gameInstanceService.validatePlayerType(player);

    // Add the new status instance
    status.id = `status-${status.name}-${Date.now()}`;
    player.character.attributes.status.push({definition: status} as {definition: AttributeStatus;instance: never;});

    const gameInstanceCleaned = await this.gameInstanceService.commitGameInstance(gameInstance);

    const updatedParticipant = this.gameInstanceService.getParticipant(currentParticipant.id, gameInstanceCleaned);
    if (!updatedParticipant) {
      throw new HttpForbiddenError('Forbidden: You are no longer a participant of this game instance');
    }
    
    this.gameInstanceService.notifyGameInstanceUpdate({
      gameInstance: gameInstanceCleaned,
      by: updatedParticipant,
      event: {
        type: 'participant-status-add',
        title: 'Status Added',
        description: `${currentParticipant.name} added status "${status.name}" to ${player.character.name}`,
      }
    });
    
    return gameInstanceCleaned;
  }

  @Put('/game-instances/:gameInstanceId/participants/:participantId/statuses/:statusId')
  public async updateParticipantStatus(
    status: AttributeStatus,
    params: {gameInstanceId: string, participantId: string, statusId: string},
    query: unknown,
    req: Request,
  ): Promise<GameInstance> {
    const { gameInstance, currentParticipant } = await this.gameInstanceService.validateContext(params.gameInstanceId, req, 'player');
    this.gameInstanceService.validateParticipantPermission(currentParticipant, params.participantId);

    const participantIndex = this.gameInstanceService.findParticipantIndex(gameInstance, params.participantId);
    const player = gameInstance.participants[participantIndex];
    this.gameInstanceService.validatePlayerType(player);

    // Find and update the status instance
    const statusIndex = player.character.attributes.status.findIndex(s => s.definition.id === params.statusId);
    if (statusIndex === -1) {
      throw new HttpForbiddenError(`Status with id ${params.statusId} not found`);
    }

    // Update the status (keeping the current value if needed)
    player.character.attributes.status[statusIndex].definition = status

    const gameInstanceCleaned = await this.gameInstanceService.commitGameInstance(gameInstance);

    const updatedParticipant = this.gameInstanceService.getParticipant(currentParticipant.id, gameInstanceCleaned);
    if (!updatedParticipant) {
      throw new HttpForbiddenError('Forbidden: You are no longer a participant of this game instance');
    }
    
    this.gameInstanceService.notifyGameInstanceUpdate({
      gameInstance: gameInstanceCleaned,
      by: updatedParticipant,
      event: {
        type: 'participant-status-update',
        title: 'Status Updated',
        description: `${currentParticipant.name} updated status "${status.name}" for ${player.character.name}`,
      }
    });
    
    return gameInstanceCleaned;
  }

  @Delete('/game-instances/:gameInstanceId/participants/:participantId/statuses/:statusId')
  public async deleteParticipantStatus(
    body: unknown,
    params: {gameInstanceId: string, participantId: string, statusId: string},
    query: unknown,
    req: Request,
  ): Promise<GameInstance> {
    const { gameInstance, currentParticipant } = await this.gameInstanceService.validateContext(params.gameInstanceId, req, 'player');
    this.gameInstanceService.validateParticipantPermission(currentParticipant, params.participantId);

    const participantIndex = this.gameInstanceService.findParticipantIndex(gameInstance, params.participantId);
    const player = gameInstance.participants[participantIndex];
    this.gameInstanceService.validatePlayerType(player);

    // Find and remove the status
    const statusIndex = player.character.attributes.status.findIndex(s => s.definition.id === params.statusId);
    if (statusIndex === -1) {
      throw new HttpForbiddenError(`Status with id ${params.statusId} not found`);
    }

    const deletedStatus = player.character.attributes.status[statusIndex];
    player.character.attributes.status.splice(statusIndex, 1);

    const gameInstanceCleaned = await this.gameInstanceService.commitGameInstance(gameInstance);

    const updatedParticipant = this.gameInstanceService.getParticipant(currentParticipant.id, gameInstanceCleaned);
    if (!updatedParticipant) {
      throw new HttpForbiddenError('Forbidden: You are no longer a participant of this game instance');
    }
    
    this.gameInstanceService.notifyGameInstanceUpdate({
      gameInstance: gameInstanceCleaned,
      by: updatedParticipant,
      event: {
        type: 'participant-status-delete',
        title: 'Status Deleted',
        description: `${currentParticipant.name} deleted status "${deletedStatus.definition.name}" from ${player.character.name}`,
      }
    });
    
    return gameInstanceCleaned;
  }
}
