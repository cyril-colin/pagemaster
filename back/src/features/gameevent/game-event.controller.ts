import { Request } from 'express';
import { SocketServerService } from 'src/core/socket.service';
import { EventBase } from 'src/pagemaster-schemas/src/events.types';
import { Get, Post } from '../../core/router/controller.decorators';
import { HttpBadRequestError, HttpNotFoundError } from '../../core/router/http-errors';
import { HEADER_CURRENT_PARTICIPANT } from '../../pagemaster-schemas/src/constants';
import { isEventPlayerType } from '../../pagemaster-schemas/src/events-player.types';
import { GameSessionMongoClient } from '../gamesession/game-session.mongo-client';
import { EventDiceRollExecuter } from './event-executer/event-dice-roll.executer';
import { GameEventExecuter } from './event-executer/event-executer';
import { EventLootBoxExecuter } from './event-executer/event-loot-box.executer';
import { EventPlayerExecuter } from './event-executer/event-player/event-player.executer';
import { GameEventMongoClient } from './game-event.mongo-client';

export class GameEventController {
  constructor(
    private gameInstanceMongoClient: GameSessionMongoClient,
    private gameEventMongoClient: GameEventMongoClient,
    private socketServerService: SocketServerService,
  ) {}

  @Get('/game-events/:gameSessionId')
  public async getAllGameEvents(body: unknown, params: { gameSessionId: string }): Promise<EventBase[]> {
    const gameEventDocuments = await this.gameEventMongoClient.getEventsByGameSessionId(params.gameSessionId);
    return gameEventDocuments.map(doc => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, ...gameEvent } = doc;
      return gameEvent as EventBase;
    });
  }

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


    const executer = this.getExecuter(gameEvent);
    const res = await executer.executeEvent(gameEvent, gameSession.master, gameSession, currentParticipantId);

    await this.gameInstanceMongoClient.updateGameSession(res.newGameSession.id, res.newGameSession.version || 0, res.newGameSession);
    await this.socketServerService.notifySessionUpdate(res.newGameSession, res.event);
    await this.gameEventMongoClient.createEvent(res.event);
    return res.event;
  }

  protected getExecuter(gameEvent: EventBase): GameEventExecuter {
    if (isEventPlayerType(gameEvent.type)) {
      return new EventPlayerExecuter();
    }
    if (gameEvent.type === 'dice-roll') {
      return new EventDiceRollExecuter();
    }
    if (gameEvent.type === 'loot-box') {
      return new EventLootBoxExecuter();
    }
    throw new HttpBadRequestError(`Unsupported event type: ${gameEvent.type}`);
  }
}
