import { EventCharacterNameEdit } from '../../../../pagemaster-schemas/src/events-character.types';
import { GameEventHandlerFn } from '../../event-executer';
import { findPlayerParticipantByCharacterId, getCharacterFromParticipant } from './handler-helpers';

export const characterNameEditHandler: GameEventHandlerFn<EventCharacterNameEdit> = (event, gameSession) => {
  const participant = findPlayerParticipantByCharacterId(gameSession, event.characterId, 'name edit');
  const character = getCharacterFromParticipant(participant, 'name edit');
  
  character.name = event.name;
  return gameSession;
}
