import { EventPlayerInventoryItemDelete } from '../../../../../pagemaster-schemas/src/events-player.types';
import { GameEventHandlerFn } from '../../event-executer';
import { assertAttributeIndex, assertGameMaster, assertPlayerExists } from '../event-player.executer';

export const playerInventoryItemDeleteHandler: GameEventHandlerFn<EventPlayerInventoryItemDelete> = (event, gameSession, currentParticipantId) => {
  assertGameMaster(gameSession, currentParticipantId);
  const player = assertPlayerExists(gameSession, event.playerId);
  const inventoryIndex = assertAttributeIndex(player, 'inventory', event.inventoryId);
  const inventory = player.attributes.inventory[inventoryIndex];
  
  inventory.current = inventory.current.filter(item => item.id !== event.deletedItem.id);
  return gameSession;
}
