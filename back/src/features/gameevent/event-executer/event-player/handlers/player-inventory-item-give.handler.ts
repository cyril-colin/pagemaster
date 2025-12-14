import { EventPlayerInventoryItemGive } from '../../../../../pagemaster-schemas/src/events-player.types';
import { GameEventHandlerFn } from '../../event-executer';
import { assertAttributeIndex, assertPlayerExists } from '../event-player.executer';

export const playerInventoryItemGiveHandler: GameEventHandlerFn<EventPlayerInventoryItemGive> = (event, gameSession, currentParticipantId) => {
  // Verify the current participant is either GM or the owner of the item
  const fromPlayer = assertPlayerExists(gameSession, event.playerId);
  const isGM = gameSession.master.id === currentParticipantId;
  const isOwner = fromPlayer.id === currentParticipantId;
  
  if (!isGM && !isOwner) {
    throw new Error('Only the owner or GM can give items');
  }

  // Get the source inventory
  const fromInventoryIndex = assertAttributeIndex(fromPlayer, 'inventory', event.fromInventoryId);
  const fromInventory = fromPlayer.attributes.inventory[fromInventoryIndex];
  
  // Remove item from source inventory
  const itemIndex = fromInventory.current.findIndex(item => item.id === event.givenItem.id);
  if (itemIndex === -1) {
    throw new Error(`Item ${event.givenItem.id} not found in inventory ${event.fromInventoryId}`);
  }
  fromInventory.current.splice(itemIndex, 1);
  
  // Add item to recipient's inventory
  const toPlayer = assertPlayerExists(gameSession, event.toPlayerId);
  const toInventoryIndex = assertAttributeIndex(toPlayer, 'inventory', event.toInventoryId);
  const toInventory = toPlayer.attributes.inventory[toInventoryIndex];
  
  toInventory.current.push(event.givenItem);
  
  return gameSession;
};
