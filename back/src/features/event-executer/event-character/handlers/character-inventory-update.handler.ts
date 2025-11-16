import { EventCharacterInventoryUpdate } from '../../../../pagemaster-schemas/src/events-character.types';
import { GameEventHandlerFn } from '../../event-executer';
import { findPlayerParticipantByCharacterId, getCharacterFromParticipant } from './handler-helpers';

export const characterInventoryUpdateHandler: GameEventHandlerFn<EventCharacterInventoryUpdate> = (event, gameSession) => {
  const participant = findPlayerParticipantByCharacterId(gameSession, event.characterId, 'inventory update');
  const character = getCharacterFromParticipant(participant, 'inventory update');
  
  const inventoryIndex = character.attributes.inventory.findIndex(inv => inv.id === event.inventory.id);
  if (inventoryIndex === -1) {
    throw new Error('Inventory not found for update');
  }
  character.attributes.inventory[inventoryIndex] = event.inventory;
  return gameSession;
}
