import { Request } from 'express';
import { Delete, Patch, Post, Put } from '../../core/router/controller.decorators';
import { HttpForbiddenError } from '../../core/router/http-errors';
import { AttributeStatus } from '../../pagemaster-schemas/src/attributes.types';
import { Character, GameSession } from '../../pagemaster-schemas/src/pagemaster.types';
import { GameSessionService } from './game-session.service';

export class ParticipantStatusesController {
  constructor(private gameInstanceService: GameSessionService) {}

  @Patch('/game-sessions/:gameSessionId/participants/:participantId/statuses')
  public async updateParticipantStatuses(
    attributes: Pick<Character['attributes'], 'status'>,
    params: {gameSessionId: string, participantId: string},
    query: unknown,
    req: Request,
  ): Promise<GameSession> {
    const { gameSession, currentParticipant } = await this.gameInstanceService.validateContext(params.gameSessionId, req, 'player');
    this.gameInstanceService.validateParticipantPermission(currentParticipant, params.participantId);

    const participantIndex = this.gameInstanceService.findParticipantIndex(gameSession, params.participantId);
    const player = gameSession.participants[participantIndex];
    this.gameInstanceService.validatePlayerType(player);

    player.character.attributes.status = attributes.status;

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
        description: `${currentParticipant.name} updated statuses of ${player.character.name}`,
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
    const { gameSession, currentParticipant } = await this.gameInstanceService.validateContext(params.gameSessionId, req, 'player');
    this.gameInstanceService.validateParticipantPermission(currentParticipant, params.participantId);

    const participantIndex = this.gameInstanceService.findParticipantIndex(gameSession, params.participantId);
    const player = gameSession.participants[participantIndex];
    this.gameInstanceService.validatePlayerType(player);

    // Add the new status instance
    status.id = `status-${status.name}-${Date.now()}`;
    player.character.attributes.status.push(status);

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
        description: `${currentParticipant.name} added status "${status.name}" to ${player.character.name}`,
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
    const { gameSession, currentParticipant } = await this.gameInstanceService.validateContext(params.gameSessionId, req, 'player');
    this.gameInstanceService.validateParticipantPermission(currentParticipant, params.participantId);

    const participantIndex = this.gameInstanceService.findParticipantIndex(gameSession, params.participantId);
    const player = gameSession.participants[participantIndex];
    this.gameInstanceService.validatePlayerType(player);

    // Find and update the status instance
    const statusIndex = player.character.attributes.status.findIndex(s => s.id === params.statusId);
    if (statusIndex === -1) {
      throw new HttpForbiddenError(`Status with id ${params.statusId} not found`);
    }

    // Update the status (keeping the current value if needed)
    player.character.attributes.status[statusIndex] = status

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
        description: `${currentParticipant.name} updated status "${status.name}" for ${player.character.name}`,
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
    const { gameSession, currentParticipant } = await this.gameInstanceService.validateContext(params.gameSessionId, req, 'player');
    this.gameInstanceService.validateParticipantPermission(currentParticipant, params.participantId);

    const participantIndex = this.gameInstanceService.findParticipantIndex(gameSession, params.participantId);
    const player = gameSession.participants[participantIndex];
    this.gameInstanceService.validatePlayerType(player);

    // Find and remove the status
    const statusIndex = player.character.attributes.status.findIndex(s => s.id === params.statusId);
    if (statusIndex === -1) {
      throw new HttpForbiddenError(`Status with id ${params.statusId} not found`);
    }

    const deletedStatus = player.character.attributes.status[statusIndex];
    player.character.attributes.status.splice(statusIndex, 1);

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
        description: `${currentParticipant.name} deleted status "${deletedStatus.name}" from ${player.character.name}`,
      }
    });
    
    return gameInstanceCleaned;
  }
}
