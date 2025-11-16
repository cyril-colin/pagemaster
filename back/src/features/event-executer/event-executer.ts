import { SocketServerService } from '../../core/socket.service';
import { EventBase, EventCharacterBase, EventCharacterComputed } from '../../pagemaster-schemas/src/events.types';
import { GameSession, Participant } from '../../pagemaster-schemas/src/pagemaster.types';
import { GameSessionMongoClient } from '../gameinstance/game-instance.mongo-client';

export abstract class GameEventHandler<T extends EventCharacterBase> {
  public abstract handle(event: T, gameSession: GameSession): GameSession;
}

export type GameEventHandlerFn<T extends EventCharacterBase = EventCharacterBase> = (
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
    triggerer: Participant,
    currentSession: GameSession,
  ): Promise<EventCharacterComputed<EventCharacterBase>>;
}