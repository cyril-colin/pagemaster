import { EventPlayerBarDelete } from '../../../../../pagemaster-schemas/src/events-player.types';
import { GameEventHandlerFn } from '../../event-executer';
import { assertGameMaster, assertPlayerExists } from '../event-player.executer';

export const playerBarDeleteHandler: GameEventHandlerFn<EventPlayerBarDelete> = (event, gameSession, currentParticipantId) => {
  assertGameMaster(gameSession, currentParticipantId);
  const player = assertPlayerExists(gameSession, event.playerId);

  player.attributes.bar = player.attributes.bar.filter(b => b.id !== event.barId);
  return gameSession;
}
