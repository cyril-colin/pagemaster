import { EventCharacterInventoryItemDelete } from '../../../../pagemaster-schemas/src/events-character.types';
import { GameEventHandlerFn } from '../../event-executer';
import { findInventoryById, findPlayerParticipantByCharacterId, getCharacterFromParticipant } from './handler-helpers';

export const characterInventoryItemDeleteHandler: GameEventHandlerFn<EventCharacterInventoryItemDelete> = (event, gameSession) => {
  const participant = findPlayerParticipantByCharacterId(gameSession, event.characterId, 'deleting inventory item');
  const character = getCharacterFromParticipant(participant, 'deleting inventory item');
  const inventory = findInventoryById(character, event.inventoryId, 'deleting item');
  
  inventory.current = inventory.current.filter(item => item.id !== event.itemId);
  return gameSession;
}
