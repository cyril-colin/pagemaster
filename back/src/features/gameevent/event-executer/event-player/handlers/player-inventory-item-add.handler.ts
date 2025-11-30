import { EventPlayerInventoryItemAdd } from '../../../../../pagemaster-schemas/src/events-player.types';
import { GameEventHandlerFn } from '../../event-executer';
import { assertAttributeIndex, assertGameMaster, assertPlayerExists } from '../event-player.executer';


export const playerInventoryItemAddHandler: GameEventHandlerFn<EventPlayerInventoryItemAdd> = (event, gameSession, currentParticipantId) => {
  assertGameMaster(gameSession, currentParticipantId);
  const player = assertPlayerExists(gameSession, event.playerId);
  const inventoryIndex = assertAttributeIndex(player, 'inventory', event.inventoryId);
  const inventory = player.attributes.inventory[inventoryIndex];

  const withId = event.newItems.map(item => ({ ...item, id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` }));
  
  inventory.current.push(...withId);
  return gameSession;
}
