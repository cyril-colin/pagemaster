import { Request } from 'express';
import { HttpBadRequestError, HttpForbiddenError, HttpNotFoundError } from '../../core/router/http-errors';
import { SocketServerService } from '../../core/socket.service';
import { HEADER_CURRENT_PARTICIPANT } from '../../pagemaster-schemas/src/constants';
import { EventBase } from '../../pagemaster-schemas/src/events.types';
import { GameMaster, GameSession, Player } from '../../pagemaster-schemas/src/pagemaster.types';
import { GameSessionMongoClient } from './game-session.mongo-client';

export class GameSessionService {
  constructor(
    private mongoClient: GameSessionMongoClient,
    private socketServerService: SocketServerService,
  ) {}

  public async validateContext(
    gameSessionId: string,
    req: Request,
  ): Promise<{gameSession: GameSession, currentParticipant: Player | GameMaster}> {
    if (!gameSessionId) {
      throw new HttpBadRequestError('Missing gameSessionId parameter');
    }
    const gameSession = await this.mongoClient.findGameSessionById(gameSessionId);
    if (!gameSession) {
      throw new HttpNotFoundError('Game session not found');
    }

    const currentParticipantId = (Array.isArray(req.headers[HEADER_CURRENT_PARTICIPANT]) ? null : req.headers[HEADER_CURRENT_PARTICIPANT]) || null;
    const currentParticipant = this.getParticipant(currentParticipantId, gameSession);
    if (!currentParticipant) {
      throw new HttpForbiddenError('Forbidden: You are not a participant of this game session');
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

  public getParticipant(participantId: string |null, gameSession: GameSession): Player | GameMaster | null {
    if (participantId === gameSession.master.id) {
      return gameSession.master;
    }

    const currentParticipant = gameSession.players.find(p => p.id === participantId);
    return currentParticipant || null;
  }

  public findParticipantIndex(gameSession: GameSession, participantId: string): number {
    const participantIndex = gameSession.players.findIndex(p => p.id === participantId);
    if (participantIndex === -1) {
      throw new HttpBadRequestError('Participant not found in the specified game session');
    }
    return participantIndex;
  }

  public notifyGameSessionUpdate(params: {
    gameSession: GameSession,
    by: Player | GameMaster,
    event: {
      type: string,
      title: string,
      description: string,
      metadata?: Record<string, unknown>
    }
  }): void {
    // Create a simple event base for notification
    const eventBase: EventBase = {
      id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
      timestamp: Date.now(),
      type: params.event.type,
      gameSessionId: params.gameSession.id,
    };
    this.socketServerService.notifySessionUpdate(params.gameSession, eventBase);
  }
}
