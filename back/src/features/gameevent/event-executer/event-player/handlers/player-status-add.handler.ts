import { EventPlayerStatusAdd } from '../../../../../pagemaster-schemas/src/events-player.types';
import { GameEventHandlerFn } from '../../event-executer';

export const playerStatusAddHandler: GameEventHandlerFn<EventPlayerStatusAdd> = (event, gameSession) => {
  const player = gameSession.players.find(p => p.id === event.playerId);
  if (!player) {
    throw new Error('Player not found in game session');
  }

  player.attributes.status.push({ ...event.newStatus, id: `status_${Date.now()}` });
  return gameSession;
}
