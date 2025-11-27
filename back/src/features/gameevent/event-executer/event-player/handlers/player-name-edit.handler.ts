import { EventPlayerNameEdit } from '../../../../../pagemaster-schemas/src/events-player.types';
import { GameEventHandlerFn } from '../../event-executer';
import { assertGameMaster, assertPlayerExists } from '../event-player.executer';

export const playerNameEditHandler: GameEventHandlerFn<EventPlayerNameEdit> = (event, gameSession, currentParticipantId) => {
  assertGameMaster(gameSession, currentParticipantId);
  const player = assertPlayerExists(gameSession, event.playerId);
  
  player.name = event.newName;
  return gameSession;
}
