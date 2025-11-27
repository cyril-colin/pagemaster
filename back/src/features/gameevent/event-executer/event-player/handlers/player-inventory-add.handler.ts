import { EventPlayerInventoryAdd } from '../../../../../pagemaster-schemas/src/events-player.types';
import { GameEventHandlerFn } from '../../event-executer';
import { assertGameMaster, assertPlayerExists } from '../event-player.executer';

export const playerInventoryAddHandler: GameEventHandlerFn<EventPlayerInventoryAdd> = (event, gameSession, currentParticipantId) => {
  assertGameMaster(gameSession, currentParticipantId);
  const player = assertPlayerExists(gameSession, event.playerId);
  
  player.attributes.inventory.push({ ...event.newInventory, id: `inv_${Date.now()}` });
  return gameSession;
}
