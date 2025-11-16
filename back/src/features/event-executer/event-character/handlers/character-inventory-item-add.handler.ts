import { EventCharacterInventoryItemAdd } from '../../../../pagemaster-schemas/src/events-character.types';
import { GameEventHandlerFn } from '../../event-executer';
import { findInventoryById, findPlayerParticipantByCharacterId, getCharacterFromParticipant } from './handler-helpers';

export const characterInventoryItemAddHandler: GameEventHandlerFn<EventCharacterInventoryItemAdd> = (event, gameSession) => {
  const participant = findPlayerParticipantByCharacterId(gameSession, event.characterId, 'adding inventory item');
  const character = getCharacterFromParticipant(participant, 'adding inventory item');
  const inventory = findInventoryById(character, event.inventoryId, 'adding item');
  
  inventory.current.push({ ...event.item, id: `item_${Date.now()}` });
  return gameSession;
}
