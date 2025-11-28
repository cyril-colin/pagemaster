import { EventPlayerInventoryUpdate } from '../../../../../pagemaster-schemas/src/events-player.types';
import { GameEventHandlerFn } from '../../event-executer';
import { assertAttributeIndex, assertGameMaster, assertPlayerExists } from '../event-player.executer';

export const playerInventoryUpdateHandler: GameEventHandlerFn<EventPlayerInventoryUpdate> = (event, gameSession, currentParticipantId) => {
  assertGameMaster(gameSession, currentParticipantId);
  const player = assertPlayerExists(gameSession, event.playerId);
  const inventoryIndex = assertAttributeIndex(player, 'inventory', event.newInventory.id);

  player.attributes.inventory[inventoryIndex] = event.newInventory;
  return gameSession;
}
