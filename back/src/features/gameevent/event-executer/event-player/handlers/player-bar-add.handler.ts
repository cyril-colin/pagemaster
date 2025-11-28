import { EventPlayerBarAdd } from '../../../../../pagemaster-schemas/src/events-player.types';
import { GameEventHandlerFn } from '../../event-executer';
import { assertGameMaster, assertPlayerExists } from '../event-player.executer';

export const playerBarAddHandler: GameEventHandlerFn<EventPlayerBarAdd> = (event, gameSession, currentParticipantId) => {
  assertGameMaster(gameSession, currentParticipantId);
  const player = assertPlayerExists(gameSession, event.playerId);

  player.attributes.bar.push({ ...event.newBar, id: `bar_${Date.now()}` });
  return gameSession;
}
