import { EventPlayerInventoryDelete } from '../../../../../pagemaster-schemas/src/events-player.types';
import { GameEventHandlerFn } from '../../event-executer';

export const playerInventoryDeleteHandler: GameEventHandlerFn<EventPlayerInventoryDelete> = (event, gameSession) => {
  const player = gameSession.players.find(p => p.id === event.playerId);
  if (!player) {
    throw new Error('Player not found in game session');
  }
  
  player.attributes.inventory = player.attributes.inventory.filter(inv => inv.id !== event.inventoryId);
  return gameSession;
}
