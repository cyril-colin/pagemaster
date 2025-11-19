import { EventPlayerInventoryUpdate } from '../../../../../pagemaster-schemas/src/events-player.types';
import { GameEventHandlerFn } from '../../event-executer';

export const playerInventoryUpdateHandler: GameEventHandlerFn<EventPlayerInventoryUpdate> = (event, gameSession) => {
  const player = gameSession.players.find(p => p.id === event.playerId);
  if (!player) {
    throw new Error('Player not found in game session');
  }
  
  const inventoryIndex = player.attributes.inventory.findIndex(inv => inv.id === event.newInventory.id);
  if (inventoryIndex === -1) {
    throw new Error('Inventory not found for update');
  }
  player.attributes.inventory[inventoryIndex] = event.newInventory;
  return gameSession;
}
