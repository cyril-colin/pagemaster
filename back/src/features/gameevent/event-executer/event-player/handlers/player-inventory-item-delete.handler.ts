import { EventPlayerInventoryItemDelete } from '../../../../../pagemaster-schemas/src/events-player.types';
import { GameEventHandlerFn } from '../../event-executer';

export const playerInventoryItemDeleteHandler: GameEventHandlerFn<EventPlayerInventoryItemDelete> = (event, gameSession) => {
  const player = gameSession.players.find(p => p.id === event.playerId);
  if (!player) {
    throw new Error('Player not found in game session');
  }
  const inventory = player.attributes.inventory.find(inv => inv.id === event.inventoryId);
  if (!inventory) {
    throw new Error('Inventory not found in player attributes');
  }
  
  inventory.current = inventory.current.filter(item => item.id !== event.itemId);
  return gameSession;
}
