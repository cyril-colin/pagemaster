import { EventPlayerBarEdit } from '../../../../pagemaster-schemas/src/events-player.types';
import { GameEventHandlerFn } from '../../event-executer';

export const playerBarEditHandler: GameEventHandlerFn<EventPlayerBarEdit> = (event, gameSession) => {
  const player = gameSession.players.find(p => p.id === event.playerId);
  if (!player) {
    throw new Error('Player not found in game session');
  }

  const barIndex = player.attributes.bar.findIndex(b => b.id === event.newBar.id);
  if (barIndex === -1) {
    throw new Error('Bar not found for update');
  }
  player.attributes.bar[barIndex] = event.newBar;
  return gameSession;
}
