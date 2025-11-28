import { EventPlayerStatusEdit } from '../../../../../pagemaster-schemas/src/events-player.types';
import { GameEventHandlerFn } from '../../event-executer';
import { assertAttributeIndex, assertGameMaster, assertPlayerExists } from '../event-player.executer';

export const playerStatusEditHandler: GameEventHandlerFn<EventPlayerStatusEdit> = (event, gameSession, currentParticipantId) => {
  assertGameMaster(gameSession, currentParticipantId);
  const player = assertPlayerExists(gameSession, event.playerId);
  const statusIndex = assertAttributeIndex(player, 'status', event.newStatus.id);
  player.attributes.status[statusIndex] = event.newStatus;
  return gameSession;
}
