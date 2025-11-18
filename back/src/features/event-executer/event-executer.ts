import { SocketServerService } from '../../core/socket.service';
import { EventBase, EventPlayerBase, EventPlayerComputed } from '../../pagemaster-schemas/src/events.types';
import { GameMaster, GameSession, Player } from '../../pagemaster-schemas/src/pagemaster.types';
import { GameSessionMongoClient } from '../gamesession/game-session.mongo-client';

export abstract class GameEventHandler<T extends EventPlayerBase> {
  public abstract handle(event: T, gameSession: GameSession): GameSession;
}

export type GameEventHandlerFn<T extends EventPlayerBase = EventPlayerBase> = (
  event: T,
  gameSession: GameSession,
) => GameSession;

export abstract class GameEventExecuter {
  constructor(
    protected mongoClient: GameSessionMongoClient,
    protected socketServerService: SocketServerService,
  ) {}

  public abstract executeEvent(
    gameEvent: EventBase,
    triggerer: Player | GameMaster,
    currentSession: GameSession,
  ): Promise<EventPlayerComputed<EventPlayerBase>>;
}