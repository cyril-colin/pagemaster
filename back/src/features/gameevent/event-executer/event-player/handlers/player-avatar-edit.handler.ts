import { EventPlayerAvatarEdit } from '../../../../../pagemaster-schemas/src/events-player.types';
import { GameEventHandlerFn } from '../../event-executer';

export const playerAvatarEditHandler: GameEventHandlerFn<EventPlayerAvatarEdit> = (event, gameSession) => {
  const player = gameSession.players.find(p => p.id === event.playerId);
  if (!player) {
    throw new Error('Player not found in game session');
  }
  
  player.avatar = event.newAvatar;
  return gameSession;
}
