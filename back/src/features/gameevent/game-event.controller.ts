import { Request } from 'express';
import { SocketServerService } from 'src/core/socket.service';
import { EventBase } from 'src/pagemaster-schemas/src/events.types';
import { Post } from '../../core/router/controller.decorators';
import { HttpBadRequestError, HttpForbiddenError, HttpNotFoundError } from '../../core/router/http-errors';
import { HEADER_CURRENT_PARTICIPANT } from '../../pagemaster-schemas/src/constants';
import { isEventPlayerType } from '../../pagemaster-schemas/src/events-player.types';
import { GameEventExecuter } from '../event-executer/event-executer';
import { EventPlayerExecuter } from '../event-executer/event-player/event-player.executer';
import { GameSessionMongoClient } from '../gamesession/game-session.mongo-client';

export class GameEventController {
  constructor(
    private gameInstanceMongoClient: GameSessionMongoClient,
    private socketServerService: SocketServerService,
  ) {}

  @Post('/game-events/command')
  public async createCommandGameEvent(
    gameEvent: EventBase,
    params: unknown,
    query: unknown,
    req: Request,
  ): Promise<EventBase> {
    const gameSession = await this.gameInstanceMongoClient.findGameSessionById(gameEvent.gameSessionId);
    if (!gameSession) {
      throw new HttpNotFoundError('Game session not found');
    }
    const currentParticipantId = (Array.isArray(req.headers[HEADER_CURRENT_PARTICIPANT]) ? null : req.headers[HEADER_CURRENT_PARTICIPANT]) || null;
    if (currentParticipantId !== gameSession.master.id) {
      throw new HttpForbiddenError('Forbidden: Only the game master can execute command events');
    }


    const executer = this.getExecuter(gameEvent);
    const res = await executer.executeEvent(gameEvent, gameSession.master, gameSession);

    console.log('Game event executed:', res.newGameSession.players.map(p => ({id: p.id, name: p.name})));

    await this.gameInstanceMongoClient.updateGameSession(res.newGameSession.id, res.newGameSession.version || 0, res.newGameSession);
    await this.socketServerService.notifySessionUpdate(res.newGameSession, res.event);
    return res.event;
  }

  protected getExecuter(gameEvent: EventBase,): GameEventExecuter {
    if (isEventPlayerType(gameEvent.type)) {
      return new EventPlayerExecuter();
    }
    
    throw new HttpBadRequestError(`Unsupported event type: ${gameEvent.type}`);
  }
}
