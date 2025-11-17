import { Request } from 'express';
import { Delete, Patch, Post, Put } from '../../core/router/controller.decorators';
import { HttpForbiddenError } from '../../core/router/http-errors';
import { AttributeStatus } from '../../pagemaster-schemas/src/attributes.types';
import { GameSession, Player } from '../../pagemaster-schemas/src/pagemaster.types';
import { GameSessionService } from './game-session.service';

export class ParticipantStatusesController {
  constructor(private gameInstanceService: GameSessionService) {}

  @Patch('/game-sessions/:gameSessionId/participants/:participantId/statuses')
  public async updateParticipantStatuses(
    attributes: Pick<Player['attributes'], 'status'>,
    params: {gameSessionId: string, participantId: string},
    query: unknown,
    req: Request,
  ): Promise<GameSession> {
    const { gameSession, currentParticipant } = await this.gameInstanceService.validateContext(params.gameSessionId, req);

    const participantIndex = this.gameInstanceService.findParticipantIndex(gameSession, params.participantId);
    const player = gameSession.players[participantIndex];

    player.attributes.status = attributes.status;

    const gameInstanceCleaned = await this.gameInstanceService.commitGameSession(gameSession);

    const updatedParticipant = this.gameInstanceService.getParticipant(currentParticipant.id, gameInstanceCleaned);
    if (!updatedParticipant) {
      throw new HttpForbiddenError('Forbidden: You are no longer a participant of this game instance');
    }
    
    this.gameInstanceService.notifyGameSessionUpdate({
      gameSession: gameInstanceCleaned,
      by: updatedParticipant,
      event: {
        type: 'participant-statuses-update',
        title: 'Statuses Updated',
        description: `${currentParticipant.name} updated statuses of ${player.name}`,
      }
    });
    
    return gameInstanceCleaned;
  }

  @Post('/game-sessions/:gameSessionId/participants/:participantId/statuses')
  public async addParticipantStatus(
    status: AttributeStatus,
    params: {gameSessionId: string, participantId: string},
    query: unknown,
    req: Request,
  ): Promise<GameSession> {
    const { gameSession, currentParticipant } = await this.gameInstanceService.validateContext(params.gameSessionId, req);

    const participantIndex = this.gameInstanceService.findParticipantIndex(gameSession, params.participantId);
    const player = gameSession.players[participantIndex];

    // Add the new status instance
    status.id = `status-${status.name}-${Date.now()}`;
    player.attributes.status.push(status);
    const gameInstanceCleaned = await this.gameInstanceService.commitGameSession(gameSession);

    const updatedParticipant = this.gameInstanceService.getParticipant(currentParticipant.id, gameInstanceCleaned);
    if (!updatedParticipant) {
      throw new HttpForbiddenError('Forbidden: You are no longer a participant of this game instance');
    }
    
    this.gameInstanceService.notifyGameSessionUpdate({
      gameSession: gameInstanceCleaned,
      by: updatedParticipant,
      event: {
        type: 'participant-status-add',
        title: 'Status Added',
        description: `${currentParticipant.name} added status "${status.name}" to ${player.name}`,
      }
    });
    
    return gameInstanceCleaned;
  }

  @Put('/game-sessions/:gameSessionId/participants/:participantId/statuses/:statusId')
  public async updateParticipantStatus(
    status: AttributeStatus,
    params: {gameSessionId: string, participantId: string, statusId: string},
    query: unknown,
    req: Request,
  ): Promise<GameSession> {
    const { gameSession, currentParticipant } = await this.gameInstanceService.validateContext(params.gameSessionId, req);

    const participantIndex = this.gameInstanceService.findParticipantIndex(gameSession, params.participantId);
    const player = gameSession.players[participantIndex];

    // Find and update the status instance
    const statusIndex = player.attributes.status.findIndex(s => s.id === params.statusId);
    if (statusIndex === -1) {
      throw new HttpForbiddenError(`Status with id ${params.statusId} not found`);
    }

    // Update the status (keeping the current value if needed)
    player.attributes.status[statusIndex] = status

    const gameInstanceCleaned = await this.gameInstanceService.commitGameSession(gameSession);

    const updatedParticipant = this.gameInstanceService.getParticipant(currentParticipant.id, gameInstanceCleaned);
    if (!updatedParticipant) {
      throw new HttpForbiddenError('Forbidden: You are no longer a participant of this game instance');
    }
    
    this.gameInstanceService.notifyGameSessionUpdate({
      gameSession: gameInstanceCleaned,
      by: updatedParticipant,
      event: {
        type: 'participant-status-update',
        title: 'Status Updated',
        description: `${currentParticipant.name} updated status "${status.name}" for ${player.name}`,
      }
    });
    
    return gameInstanceCleaned;
  }

  @Delete('/game-sessions/:gameSessionId/participants/:participantId/statuses/:statusId')
  public async deleteParticipantStatus(
    body: unknown,
    params: {gameSessionId: string, participantId: string, statusId: string},
    query: unknown,
    req: Request,
  ): Promise<GameSession> {
    const { gameSession, currentParticipant } = await this.gameInstanceService.validateContext(params.gameSessionId, req);

    const participantIndex = this.gameInstanceService.findParticipantIndex(gameSession, params.participantId);
    const player = gameSession.players[participantIndex];

    // Find and remove the status
    const statusIndex = player.attributes.status.findIndex(s => s.id === params.statusId);
    if (statusIndex === -1) {
      throw new HttpForbiddenError(`Status with id ${params.statusId} not found`);
    }

    const deletedStatus = player.attributes.status[statusIndex];
    player.attributes.status.splice(statusIndex, 1);

    const gameInstanceCleaned = await this.gameInstanceService.commitGameSession(gameSession);

    const updatedParticipant = this.gameInstanceService.getParticipant(currentParticipant.id, gameInstanceCleaned);
    if (!updatedParticipant) {
      throw new HttpForbiddenError('Forbidden: You are no longer a participant of this game instance');
    }
    
    this.gameInstanceService.notifyGameSessionUpdate({
      gameSession: gameInstanceCleaned,
      by: updatedParticipant,
      event: {
        type: 'participant-status-delete',
        title: 'Status Deleted',
        description: `${currentParticipant.name} deleted status "${deletedStatus.name}" from ${player.name}`,
      }
    });
    
    return gameInstanceCleaned;
  }
}
