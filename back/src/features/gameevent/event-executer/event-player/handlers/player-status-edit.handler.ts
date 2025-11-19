import { EventPlayerStatusEdit } from '../../../../../pagemaster-schemas/src/events-player.types';
import { GameEventHandlerFn } from '../../event-executer';

export const playerStatusEditHandler: GameEventHandlerFn<EventPlayerStatusEdit> = (event, gameSession) => {
  const player = gameSession.players.find(p => p.id === event.playerId);
  if (!player) {
    throw new Error('Player not found in game session');
  }

  const statusIndex = player.attributes.status.findIndex(s => s.id === event.newStatus.id);
  if (statusIndex === -1) {
    throw new Error('Status not found for update');
  }
  player.attributes.status[statusIndex] = event.newStatus;
  return gameSession;
}
