import { EventCharacterInventoryAdd } from '../../../../pagemaster-schemas/src/events-character.types';
import { GameEventHandlerFn } from '../../event-executer';
import { findPlayerParticipantByCharacterId, getCharacterFromParticipant } from './handler-helpers';

export const characterInventoryAddHandler: GameEventHandlerFn<EventCharacterInventoryAdd> = (event, gameSession) => {
  const participant = findPlayerParticipantByCharacterId(gameSession, event.characterId, 'inventory addition');
  const character = getCharacterFromParticipant(participant, 'inventory addition');
  
  character.attributes.inventory.push({ ...event.inventory, id: `inv_${Date.now()}` });
  return gameSession;
}
