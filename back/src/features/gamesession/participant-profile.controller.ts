import { Request } from 'express';
import { Patch } from '../../core/router/controller.decorators';
import { HttpForbiddenError } from '../../core/router/http-errors';
import { Character, GameSession } from '../../pagemaster-schemas/src/pagemaster.types';
import { GameSessionService } from './game-session.service';

export class ParticipantProfileController {
  constructor(private gameInstanceService: GameSessionService) {}

  @Patch('/game-sessions/:gameSessionId/participants/:participantId/rename')
  public async renameParticipant(
    character: Pick<Character, 'name'>,
    params: {gameSessionId: string, participantId: string},
    query: unknown,
    req: Request,
  ): Promise<GameSession> {
    const { gameSession, currentParticipant } = await this.gameInstanceService.validateContext(params.gameSessionId, req, 'player');
    this.gameInstanceService.validateParticipantPermission(currentParticipant, params.participantId);

    const participantIndex = this.gameInstanceService.findParticipantIndex(gameSession, params.participantId);
    const player = gameSession.participants[participantIndex];
    this.gameInstanceService.validatePlayerType(player);

    const oldName = player.character.name;
    player.character.name = character.name;

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
        description: `${currentParticipant.name} renamed participant : ${oldName} => ${character.name}`,
      }
    });
    
    return gameInstanceCleaned;
  }

  @Patch('/game-sessions/:gameSessionId/participants/:participantId/avatar')
  public async updateParticipantAvatar(
    character: Pick<Character, 'picture'>,
    params: {gameSessionId: string, participantId: string},
    query: unknown,
    req: Request,
  ): Promise<GameSession> {
    const { gameSession, currentParticipant } = await this.gameInstanceService.validateContext(params.gameSessionId, req, 'player');
    this.gameInstanceService.validateParticipantPermission(currentParticipant, params.participantId);

    const participantIndex = this.gameInstanceService.findParticipantIndex(gameSession, params.participantId);
    const player = gameSession.participants[participantIndex];
    this.gameInstanceService.validatePlayerType(player);

    player.character.picture = character.picture;

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
        description: `${currentParticipant.name} updated avatar of ${player.character.name}`,
      }
    });
    
    return gameInstanceCleaned;
  }

  @Patch('/game-sessions/:gameSessionId/participants/:participantId/description')
  public async updateParticipantDescription(
    character: Pick<Character, 'description'>,
    params: {gameSessionId: string, participantId: string},
    query: unknown,
    req: Request,
  ): Promise<GameSession> {
    const { gameSession, currentParticipant } = await this.gameInstanceService.validateContext(params.gameSessionId, req, 'player');
    this.gameInstanceService.validateParticipantPermission(currentParticipant, params.participantId);

    const participantIndex = this.gameInstanceService.findParticipantIndex(gameSession, params.participantId);
    const player = gameSession.participants[participantIndex];
    this.gameInstanceService.validatePlayerType(player);

    player.character.description = character.description;

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
        description: `${currentParticipant.name} updated description of ${player.character.name}`,
      }
    });
    
    return gameInstanceCleaned;
  }
}
