import { EventPlayerInventoryDelete } from '../../../../../pagemaster-schemas/src/events-player.types';
import { GameEventHandlerFn } from '../../event-executer';
import { assertGameMaster, assertPlayerExists } from '../event-player.executer';

export const playerInventoryDeleteHandler: GameEventHandlerFn<EventPlayerInventoryDelete> = (event, gameSession, currentParticipantId) => {
  assertGameMaster(gameSession, currentParticipantId);
  const player = assertPlayerExists(gameSession, event.playerId);
  
  player.attributes.inventory = player.attributes.inventory.filter(inv => inv.id !== event.inventoryId);
  return gameSession;
}
