import { Request } from 'express';
import { EventBase } from 'src/pagemaster-schemas/src/events.types';
import { Post } from '../../core/router/controller.decorators';
import { HttpBadRequestError, HttpForbiddenError, HttpNotFoundError } from '../../core/router/http-errors';
import { HEADER_CURRENT_PARTICIPANT } from '../../pagemaster-schemas/src/constants';
import { EventPlayerTypes } from '../../pagemaster-schemas/src/events-player.types';
import { GameEventExecuter } from '../event-executer/event-executer';
import { EventPlayerExecuter } from '../event-executer/event-player/event-player.executer';
import { GameSessionMongoClient } from '../gamesession/game-session.mongo-client';

const PLAYER_EVENT_TYPES = new Set<EventPlayerTypes>([
  EventPlayerTypes.PLAYER_INVENTORY_DELETE,
  EventPlayerTypes.PLAYER_INVENTORY_ADD,
  EventPlayerTypes.PLAYER_INVENTORY_UPDATE,
  EventPlayerTypes.PLAYER_INVENTORY_ITEM_ADD,
  EventPlayerTypes.PLAYER_INVENTORY_ITEM_EDIT,
  EventPlayerTypes.PLAYER_INVENTORY_ITEM_DELETE,
  EventPlayerTypes.PLAYER_NAME_EDIT,
  EventPlayerTypes.PLAYER_DESCRIPTION_EDIT,
  EventPlayerTypes.PLAYER_AVATAR_EDIT,
  EventPlayerTypes.PLAYER_BAR_ADD,
  EventPlayerTypes.PLAYER_BAR_EDIT,
  EventPlayerTypes.PLAYER_BAR_DELETE,
  EventPlayerTypes.PLAYER_STATUS_ADD,
  EventPlayerTypes.PLAYER_STATUS_EDIT,
  EventPlayerTypes.PLAYER_STATUS_DELETE,
]);

export class GameEventController {
  constructor(
    private gameInstanceMongoClient: GameSessionMongoClient,
    private playerEventExecuter: EventPlayerExecuter,
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
    return res;
  }

  protected getExecuter(gameEvent: EventBase,): GameEventExecuter {
    if (PLAYER_EVENT_TYPES.has(gameEvent.type as EventPlayerTypes)) {
      return this.playerEventExecuter;
    }
    
    throw new HttpBadRequestError(`Unsupported event type: ${gameEvent.type}`);
  }
}
