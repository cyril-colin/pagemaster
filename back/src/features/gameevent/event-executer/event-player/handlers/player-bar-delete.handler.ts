import { EventPlayerBarDelete } from '../../../../../pagemaster-schemas/src/events-player.types';
import { GameEventHandlerFn } from '../../event-executer';

export const playerBarDeleteHandler: GameEventHandlerFn<EventPlayerBarDelete> = (event, gameSession) => {
  const player = gameSession.players.find(p => p.id === event.playerId);
  if (!player) {
    throw new Error('Player not found in game session');
  }

  player.attributes.bar = player.attributes.bar.filter(b => b.id !== event.barId);
  return gameSession;
}
