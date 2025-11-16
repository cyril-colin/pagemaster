import { AttributeInventory } from '../../../../pagemaster-schemas/src/attributes.types';
import { Character, GameSession, Participant } from '../../../../pagemaster-schemas/src/pagemaster.types';

type PlayerParticipant = Extract<Participant, { type: 'player' }>;

/**
 * Finds and validates a player participant by character ID
 * @throws Error if participant or character not found
 */
export function findPlayerParticipantByCharacterId(
  gameSession: GameSession,
  characterId: string,
  errorContext: string
): PlayerParticipant {
  const participant = gameSession.participants.find(
    p => p.type === 'player' && p.character.id === characterId
  );
  
  if (!participant || participant.type !== 'player') {
    throw new Error(`Participant not found for ${errorContext}`);
  }
  
  return participant;
}

/**
 * Gets the character from a player participant
 * @throws Error if character not found
 */
export function getCharacterFromParticipant(
  participant: PlayerParticipant,
  errorContext: string
): Character {
  const character = participant.character;
  
  if (!character) {
    throw new Error(`Character not found for ${errorContext}`);
  }
  
  return character;
}

/**
 * Finds an inventory by ID in a character's inventory list
 * @throws Error if inventory not found
 */
export function findInventoryById(
  character: Character,
  inventoryId: string,
  errorContext: string
): AttributeInventory {
  const inventory = character.attributes.inventory.find(inv => inv.id === inventoryId);
  
  if (!inventory) {
    throw new Error(`Inventory not found for ${errorContext}`);
  }
  
  return inventory;
}
