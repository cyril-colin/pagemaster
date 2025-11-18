import { EventPlayerInventoryAdd } from '../../../../pagemaster-schemas/src/events-player.types';
import { GameEventHandlerFn } from '../../event-executer';

export const playerInventoryAddHandler: GameEventHandlerFn<EventPlayerInventoryAdd> = (event, gameSession) => {
  const player = gameSession.players.find(p => p.id === event.playerId);
  if (!player) {
    throw new Error('Player not found in game session');
  }
  
  player.attributes.inventory.push({ ...event.newInventory, id: `inv_${Date.now()}` });
  return gameSession;
}
