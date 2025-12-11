import { EventPlayerBase } from '../../../../../pagemaster-schemas/src/events.types';
import { Item } from '../../../../../pagemaster-schemas/src/items.types';
import { GameEventHandlerFn } from '../../event-executer';
import { assertAttributeIndex, assertGameMaster, assertPlayerExists } from '../event-player.executer';

type EventPlayerInventoryItemEdit = EventPlayerBase & {
  inventoryId: string;
  newItem: Item;
};

export const playerInventoryItemEditHandler: GameEventHandlerFn<EventPlayerInventoryItemEdit> = (event, gameSession, currentParticipantId) => {
  assertGameMaster(gameSession, currentParticipantId);
  const player = assertPlayerExists(gameSession, event.playerId);

  const inventoryIndex = assertAttributeIndex(player, 'inventory', event.inventoryId);
  const inventory = player.attributes.inventory[inventoryIndex];
  
  const itemIndex = inventory.current.findIndex(i => i.id === event.newItem.id);
  if (itemIndex === -1) {
    throw new Error('Item not found in inventory for editing');
  }
  inventory.current[itemIndex] = event.newItem;
  return gameSession;
};
