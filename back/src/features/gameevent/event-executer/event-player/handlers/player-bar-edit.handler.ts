import { EventPlayerBarEdit } from '../../../../../pagemaster-schemas/src/events-player.types';
import { GameEventHandlerFn } from '../../event-executer';
import { assertAttributeIndex, assertGameMaster, assertPlayerExists } from '../event-player.executer';

export const playerBarEditHandler: GameEventHandlerFn<EventPlayerBarEdit> = (event, gameSession, currentParticipantId) => {
  assertGameMaster(gameSession, currentParticipantId);
  const player = assertPlayerExists(gameSession, event.playerId);

  const barIndex = assertAttributeIndex(player, 'bar', event.newBar.id);
  player.attributes.bar[barIndex] = event.newBar;
  return gameSession;
}
