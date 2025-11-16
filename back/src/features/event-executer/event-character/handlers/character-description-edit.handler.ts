import { EventCharacterDescriptionEdit } from '../../../../pagemaster-schemas/src/events-character.types';
import { GameEventHandlerFn } from '../../event-executer';
import { findPlayerParticipantByCharacterId, getCharacterFromParticipant } from './handler-helpers';

export const characterDescriptionEditHandler: GameEventHandlerFn<EventCharacterDescriptionEdit> = (event, gameSession) => {
  const participant = findPlayerParticipantByCharacterId(gameSession, event.characterId, 'description edit');
  const character = getCharacterFromParticipant(participant, 'description edit');
  
  character.description = event.description;
  return gameSession;
}


