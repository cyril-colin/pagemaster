import { EventLootBox } from '../../../pagemaster-schemas/src/events.types';
import { GameMaster, GameSession, Player } from '../../../pagemaster-schemas/src/pagemaster.types';
import { GameEventExecuter } from './event-executer';

/**
 * Handles execution of dice roll events.
 */
export class EventLootBoxExecuter extends GameEventExecuter {
  public async executeEvent(
    gameEvent: EventLootBox,
    triggerer: Player | GameMaster,
    currentSession: GameSession,
  ): Promise<{ event: EventLootBox; newGameSession: GameSession }> {
    // Generate event ID if not provided
    if (!gameEvent.id) {
      gameEvent.id = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    }

    gameEvent.timestamp = Date.now();
    return {
      event: gameEvent,
      newGameSession: { ...currentSession },
    };
  }
}
