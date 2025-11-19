import { EventPlayerStatusDelete } from '../../../../../pagemaster-schemas/src/events-player.types';
import { GameEventHandlerFn } from '../../event-executer';

export const playerStatusDeleteHandler: GameEventHandlerFn<EventPlayerStatusDelete> = (event, gameSession) => {
  const player = gameSession.players.find(p => p.id === event.playerId);
  if (!player) {
    throw new Error('Player not found in game session');
  }

  player.attributes.status = player.attributes.status.filter(s => s.id !== event.statusId);
  return gameSession;
}
