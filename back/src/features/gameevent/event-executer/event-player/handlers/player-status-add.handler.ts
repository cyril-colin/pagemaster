import { EventPlayerStatusAdd } from '../../../../../pagemaster-schemas/src/events-player.types';
import { GameEventHandlerFn } from '../../event-executer';
import { assertGameMaster, assertPlayerExists } from '../event-player.executer';

export const playerStatusAddHandler: GameEventHandlerFn<EventPlayerStatusAdd> = (event, gameSession, currentParticipantId) => {
  assertGameMaster(gameSession, currentParticipantId);
  const player = assertPlayerExists(gameSession, event.playerId);

  // Add multiple statuses at once
  player.attributes.status.push(...event.newStatuses);
  return gameSession;
}
