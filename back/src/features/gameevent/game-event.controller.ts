import { Request } from 'express';
import { EventBase } from 'src/pagemaster-schemas/src/events.types';
import { Get, Post } from '../../core/router/controller.decorators';
import { HttpBadRequestError, HttpForbiddenError, HttpNotFoundError } from '../../core/router/http-errors';
import { HEADER_CURRENT_PARTICIPANT } from '../../pagemaster-schemas/src/constants';
import { EventPlayerTypes } from '../../pagemaster-schemas/src/events-player.types';
import { GameEvent } from '../../pagemaster-schemas/src/pagemaster.types';
import { GameEventExecuter } from '../event-executer/event-executer';
import { EventPlayerExecuter } from '../event-executer/event-player/event-player.executer';
import { GameSessionMongoClient } from '../gamesession/game-session.mongo-client';
import { GameEventMongoClient } from './game-event.mongo-client';

const PLAYER_EVENT_TYPES = new Set<EventPlayerTypes>([
  EventPlayerTypes.PLAYER_INVENTORY_DELETE,
  EventPlayerTypes.PLAYER_INVENTORY_ADD,
  EventPlayerTypes.PLAYER_INVENTORY_UPDATE,
  EventPlayerTypes.PLAYER_INVENTORY_ITEM_ADD,
  EventPlayerTypes.PLAYER_INVENTORY_ITEM_EDIT,
  EventPlayerTypes.PLAYER_INVENTORY_ITEM_DELETE,
  EventPlayerTypes.PLAYER_NAME_EDIT,
  EventPlayerTypes.PLAYER_DESCRIPTION_EDIT,
]);

export class GameEventController {
  constructor(
    private mongoClient: GameEventMongoClient,
    private gameInstanceMongoClient: GameSessionMongoClient,
    private playerEventExecuter: EventPlayerExecuter,
  ) {}

  @Get('/game-events')
  public async getAllGameEvents(): Promise<GameEvent[]> {
    const gameEventDocuments = await this.mongoClient.getAllGameEvents();
    
    // Convert MongoDB documents to plain GameEvent objects (remove MongoDB _id field)
    return gameEventDocuments.map(doc => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, ...gameEvent } = doc;
      return gameEvent as GameEvent;
    });
  }

  @Get('/game-events/:id')
  public async getGameEventById(body: unknown, params: {id: string}): Promise<GameEvent | null> {
    const doc = await this.mongoClient.findGameEventById(params.id);
    if (!doc) return null;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...gameEvent } = doc;
    return gameEvent as GameEvent;
  }

  @Get('/game-sessions/:gameSessionId/game-events')
  public async getGameEventsByGameInstanceId(body: unknown, params: {gameSessionId: string}): Promise<GameEvent[]> {
    const gameEventDocuments = await this.mongoClient.findGameEventsByGameSessionId(params.gameSessionId);
    // Convert MongoDB documents to plain GameEvent objects (remove MongoDB _id field)
    return gameEventDocuments.map(doc => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, ...gameEvent } = doc;
      return gameEvent as GameEvent;
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
    if (currentParticipantId !== gameSession.master.id) {
      throw new HttpForbiddenError('Forbidden: Only the game master can execute command events');
    }


    const executer = this.getExecuter(gameEvent);
    const res = await executer.executeEvent(gameEvent, gameSession.master, gameSession);
    return res;
  }

  protected getExecuter(gameEvent: EventBase,): GameEventExecuter {
    if (PLAYER_EVENT_TYPES.has(gameEvent.type as EventPlayerTypes)) {
      return this.playerEventExecuter;
    }
    
    throw new HttpBadRequestError(`Unsupported event type: ${gameEvent.type}`);
  }
}
