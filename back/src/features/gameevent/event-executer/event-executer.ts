import { EventBase, EventPlayerBase } from '../../../pagemaster-schemas/src/events.types';
import { GameMaster, GameSession, Player } from '../../../pagemaster-schemas/src/pagemaster.types';

export abstract class GameEventHandler<T extends EventPlayerBase> {
  public abstract handle(event: T, gameSession: GameSession): GameSession;
}

export type GameEventHandlerFn<T extends EventPlayerBase = EventPlayerBase> = (
  event: T,
  gameSession: GameSession,
  currentParticipantId: string | null,
) => GameSession;

export abstract class GameEventExecuter {
  public abstract executeEvent(
    gameEvent: EventBase,
    triggerer: Player | GameMaster,
    currentSession: GameSession,
    currentParticipantId: string | null,
  ): Promise<{event: EventBase, newGameSession: GameSession}>;
}