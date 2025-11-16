import { EventCharacterInventoryItemEdit } from '../../../../pagemaster-schemas/src/events-character.types';
import { GameEventHandlerFn } from '../../event-executer';
import { findInventoryById, findPlayerParticipantByCharacterId, getCharacterFromParticipant } from './handler-helpers';

export const characterInventoryItemEditHandler: GameEventHandlerFn<EventCharacterInventoryItemEdit> = (event, gameSession) => {
  const participant = findPlayerParticipantByCharacterId(gameSession, event.characterId, 'editing inventory item');
  const character = getCharacterFromParticipant(participant, 'editing inventory item');
  const inventory = findInventoryById(character, event.inventoryId, 'editing item');
  
  const itemIndex = inventory.current.findIndex(i => i.id === event.item.id);
  if (itemIndex === -1) {
    throw new Error('Item not found in inventory for editing');
  }
  inventory.current[itemIndex] = event.item;
  return gameSession;
}
