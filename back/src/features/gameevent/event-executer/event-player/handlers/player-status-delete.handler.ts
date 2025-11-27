import { EventPlayerStatusDelete } from '../../../../../pagemaster-schemas/src/events-player.types';
import { GameEventHandlerFn } from '../../event-executer';
import { assertGameMaster, assertPlayerExists } from '../event-player.executer';

export const playerStatusDeleteHandler: GameEventHandlerFn<EventPlayerStatusDelete> = (event, gameSession, currentParticipantId) => {
  assertGameMaster(gameSession, currentParticipantId);
  const player = assertPlayerExists(gameSession, event.playerId);

  player.attributes.status = player.attributes.status.filter(s => s.id !== event.statusId);
  return gameSession;
}
