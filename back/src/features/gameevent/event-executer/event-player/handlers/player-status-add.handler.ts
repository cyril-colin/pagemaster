import { EventPlayerStatusAdd } from '../../../../../pagemaster-schemas/src/events-player.types';
import { GameEventHandlerFn } from '../../event-executer';
import { assertGameMaster, assertPlayerExists } from '../event-player.executer';

export const playerStatusAddHandler: GameEventHandlerFn<EventPlayerStatusAdd> = (event, gameSession, currentParticipantId) => {
  assertGameMaster(gameSession, currentParticipantId);
  const player = assertPlayerExists(gameSession, event.playerId);

  player.attributes.status.push({ ...event.newStatus, id: `status_${Date.now()}` });
  return gameSession;
}
