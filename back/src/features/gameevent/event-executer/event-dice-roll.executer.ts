import { EventDiceRoll } from '../../../pagemaster-schemas/src/events.types';
import { GameMaster, GameSession, Player } from '../../../pagemaster-schemas/src/pagemaster.types';
import { GameEventExecuter } from './event-executer';

/**
 * Handles execution of dice roll events.
 */
export class EventDiceRollExecuter extends GameEventExecuter {
  public async executeEvent(
    gameEvent: EventDiceRoll,
    triggerer: Player | GameMaster,
    currentSession: GameSession,
  ): Promise<{ event: EventDiceRoll; newGameSession: GameSession }> {
    // Generate event ID if not provided
    if (!gameEvent.id) {
      gameEvent.id = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    }

    gameEvent.result = Math.floor(Math.random() * gameEvent.sides) + 1;

    gameEvent.timestamp = Date.now();
    return {
      event: gameEvent,
      newGameSession: { ...currentSession },
    };
  }
}
