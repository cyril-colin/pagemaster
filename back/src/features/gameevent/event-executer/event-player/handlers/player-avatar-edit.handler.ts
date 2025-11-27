import { EventPlayerAvatarEdit } from '../../../../../pagemaster-schemas/src/events-player.types';
import { GameEventHandlerFn } from '../../event-executer';
import { assertGameMaster, assertPlayerExists } from '../event-player.executer';

export const playerAvatarEditHandler: GameEventHandlerFn<EventPlayerAvatarEdit> = (event, gameSession, currentParticipantId) => {
  assertGameMaster(gameSession, currentParticipantId);
  const player = assertPlayerExists(gameSession, event.playerId);
  
  player.avatar = event.newAvatar;
  return gameSession;
}
