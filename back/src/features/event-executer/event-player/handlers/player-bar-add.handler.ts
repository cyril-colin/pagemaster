import { EventPlayerBarAdd } from '../../../../pagemaster-schemas/src/events-player.types';
import { GameEventHandlerFn } from '../../event-executer';

export const playerBarAddHandler: GameEventHandlerFn<EventPlayerBarAdd> = (event, gameSession) => {
  const player = gameSession.players.find(p => p.id === event.playerId);
  if (!player) {
    throw new Error('Player not found in game session');
  }

  player.attributes.bar.push({ ...event.newBar, id: `bar_${Date.now()}` });
  return gameSession;
}
