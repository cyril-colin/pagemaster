import { Request } from 'express';
import { Patch } from '../../core/router/controller.decorators';
import { HttpForbiddenError } from '../../core/router/http-errors';
import { GameSession, Player } from '../../pagemaster-schemas/src/pagemaster.types';
import { GameSessionService } from './game-session.service';

export class ParticipantProfileController {
  constructor(private gameInstanceService: GameSessionService) {}

  @Patch('/game-sessions/:gameSessionId/participants/:participantId/rename')
  public async renameParticipant(
    newPlayer: Pick<Player, 'name'>,
    params: {gameSessionId: string, participantId: string},
    query: unknown,
    req: Request,
  ): Promise<GameSession> {
    const { gameSession, currentParticipant } = await this.gameInstanceService.validateContext(params.gameSessionId, req);

    const participantIndex = this.gameInstanceService.findParticipantIndex(gameSession, params.participantId);
    const player = gameSession.players[participantIndex];

    const oldName = player.name;
    player.name = newPlayer.name;
    const gameInstanceCleaned = await this.gameInstanceService.commitGameSession(gameSession);

    const updatedParticipant = this.gameInstanceService.getParticipant(currentParticipant.id, gameInstanceCleaned);
    if (!updatedParticipant) {
      throw new HttpForbiddenError('Forbidden: You are no longer a participant of this game instance');
    }
    
    this.gameInstanceService.notifyGameSessionUpdate({
      gameSession: gameInstanceCleaned,
      by: updatedParticipant,
      event: {
        type: 'participant-rename',
        title: 'Participant Rename',
        description: `${currentParticipant.name} renamed participant : ${oldName} => ${newPlayer.name}`,
      }
    });
    
    return gameInstanceCleaned;
  }

  @Patch('/game-sessions/:gameSessionId/participants/:participantId/avatar')
  public async updateParticipantAvatar(
    newPlayer: Pick<Player, 'picture'>,
    params: {gameSessionId: string, participantId: string},
    query: unknown,
    req: Request,
  ): Promise<GameSession> {
    const { gameSession, currentParticipant } = await this.gameInstanceService.validateContext(params.gameSessionId, req);

    const participantIndex = this.gameInstanceService.findParticipantIndex(gameSession, params.participantId);
    const player = gameSession.players[participantIndex];

    player.picture = newPlayer.picture;

    const gameInstanceCleaned = await this.gameInstanceService.commitGameSession(gameSession);

    const updatedParticipant = this.gameInstanceService.getParticipant(currentParticipant.id, gameInstanceCleaned);
    if (!updatedParticipant) {
      throw new HttpForbiddenError('Forbidden: You are no longer a participant of this game instance');
    }
    
    this.gameInstanceService.notifyGameSessionUpdate({
      gameSession: gameInstanceCleaned,
      by: updatedParticipant,
      event: {
        type: 'participant-avatar-update',
        title: 'Avatar Updated',
        description: `${currentParticipant.name} updated avatar of ${player.name}`,
      }
    });
    
    return gameInstanceCleaned;
  }

  @Patch('/game-sessions/:gameSessionId/participants/:participantId/description')
  public async updateParticipantDescription(
    newPlayer: Pick<Player, 'description'>,
    params: {gameSessionId: string, participantId: string},
    query: unknown,
    req: Request,
  ): Promise<GameSession> {
    const { gameSession, currentParticipant } = await this.gameInstanceService.validateContext(params.gameSessionId, req);

    const participantIndex = this.gameInstanceService.findParticipantIndex(gameSession, params.participantId);
    const player = gameSession.players[participantIndex];

    player.description = newPlayer.description;

    const gameInstanceCleaned = await this.gameInstanceService.commitGameSession(gameSession);

    const updatedParticipant = this.gameInstanceService.getParticipant(currentParticipant.id, gameInstanceCleaned);
    if (!updatedParticipant) {
      throw new HttpForbiddenError('Forbidden: You are no longer a participant of this game instance');
    }
    
    this.gameInstanceService.notifyGameSessionUpdate({
      gameSession: gameInstanceCleaned,
      by: updatedParticipant,
      event: {
        type: 'participant-description-update',
        title: 'Description Updated',
        description: `${currentParticipant.name} updated description of ${player.name}`,
      }
    });
    
    return gameInstanceCleaned;
  }
}
