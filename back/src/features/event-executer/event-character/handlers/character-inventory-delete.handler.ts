import { EventCharacterInventoryDelete } from '../../../../pagemaster-schemas/src/events-character.types';
import { GameEventHandlerFn } from '../../event-executer';
import { findPlayerParticipantByCharacterId, getCharacterFromParticipant } from './handler-helpers';

export const characterInventoryDeleteHandler: GameEventHandlerFn<EventCharacterInventoryDelete> = (event, gameSession) => {
  const participant = findPlayerParticipantByCharacterId(gameSession, event.characterId, 'inventory deletion');
  const character = getCharacterFromParticipant(participant, 'inventory deletion');
  
  character.attributes.inventory = character.attributes.inventory.filter(inv => inv.id !== event.inventoryId);
  return gameSession;
}
