import { Request } from 'express';
import { HttpBadRequestError, HttpForbiddenError, HttpNotFoundError } from '../../core/router/http-errors';
import { SocketServerService } from '../../core/socket.service';
import { HEADER_CURRENT_PARTICIPANT } from '../../pagemaster-schemas/src/constants';
import { GameSession, Participant } from '../../pagemaster-schemas/src/pagemaster.types';
import { GameSessionMongoClient } from './game-session.mongo-client';

export class GameSessionService {
  constructor(
    private mongoClient: GameSessionMongoClient,
    private socketServerService: SocketServerService,
  ) {}

  public async validateContext(
    gameSessionId: string,
    req: Request,
    requiredRole: Participant['type'],
  ): Promise<{gameSession: GameSession, currentParticipant: Participant}> {
    if (!gameSessionId) {
      throw new HttpBadRequestError('Missing gameSessionId parameter');
    }
    const gameSession = await this.mongoClient.findGameSessionById(gameSessionId);
    if (!gameSession) {
      throw new HttpNotFoundError('Game session not found');
    }

    const currentParticipantId = (Array.isArray(req.headers[HEADER_CURRENT_PARTICIPANT]) ? null : req.headers[HEADER_CURRENT_PARTICIPANT]) || null;
    const currentParticipant = this.getParticipant(currentParticipantId, gameSession);
    if (requiredRole === 'gameMaster' && currentParticipant?.type !== 'gameMaster') {
      throw new HttpForbiddenError('Forbidden: You need to be a game master');
    }
    if (!currentParticipant) {
      throw new HttpForbiddenError('Forbidden: You need to be a player');
    }

    return { gameSession, currentParticipant };
  }

  public async commitGameSession(gameSession: GameSession): Promise<GameSession> {
    gameSession.version = (gameSession.version || 0) + 1;
    const updated = await this.mongoClient.updateGameSession(gameSession.id, gameSession.version -1, gameSession);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...gameSessionCleaned } = updated as GameSession & {_id: unknown};
    return gameSessionCleaned;
  }

  public getParticipant(participantId: Participant['id'] |null, gameSession: GameSession): Participant | null {
    const currentParticipant = gameSession.participants.find(p => p.id === participantId);
    return currentParticipant || null;
  }

  public validateParticipantPermission(currentParticipant: Participant, participantId: string): void {
    if ((currentParticipant.id !== participantId && currentParticipant.type !== 'gameMaster')) {
      throw new HttpForbiddenError('Forbidden: You can only update your own participant data');
    }
  }

  public findParticipantIndex(gameSession: GameSession, participantId: string): number {
    const participantIndex = gameSession.participants.findIndex(p => p.id === participantId);
    if (participantIndex === -1) {
      throw new HttpBadRequestError('Participant not found in the specified game session');
    }
    return participantIndex;
  }

  public validatePlayerType(participant: Participant): asserts participant is Participant & {type: 'player'} {
    if (participant.type !== 'player') {
      throw new HttpForbiddenError('Forbidden: Only players can have this property updated');
    }
  }

  public notifyGameSessionUpdate(params: {
    gameSession: GameSession,
    by: Participant,
    event: {
      type: string,
      title: string,
      description: string,
      metadata?: Record<string, unknown>
    }
  }): void {
    this.socketServerService.notifyGameSessionUpdate(params);
  }
}
