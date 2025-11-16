import { EventCharacterTypes } from '../../../pagemaster-schemas/src/events-character.types';
import { EventCharacterBase, EventCharacterComputed } from '../../../pagemaster-schemas/src/events.types';
import { GameSession, Participant } from '../../../pagemaster-schemas/src/pagemaster.types';
import { GameEventExecuter, GameEventHandlerFn } from '../event-executer';
import { characterDescriptionEditHandler } from './handlers/character-description-edit.handler';
import { characterInventoryAddHandler } from './handlers/character-inventory-add.handler';
import { characterInventoryDeleteHandler } from './handlers/character-inventory-delete.handler';
import { characterInventoryItemAddHandler } from './handlers/character-inventory-item-add.handler';
import { characterInventoryItemDeleteHandler } from './handlers/character-inventory-item-delete.handler';
import { characterInventoryItemEditHandler } from './handlers/character-inventory-item-edit.handler';
import { characterInventoryUpdateHandler } from './handlers/character-inventory-update.handler';
import { characterNameEditHandler } from './handlers/character-name-edit.handler';



export const EventCharacterMapper = {
  [EventCharacterTypes.CHARACTER_DESCRIPTION_EDIT]: characterDescriptionEditHandler,
  [EventCharacterTypes.CHARACTER_NAME_EDIT]: characterNameEditHandler,
  [EventCharacterTypes.CHARACTER_INVENTORY_DELETE]: characterInventoryDeleteHandler,
  [EventCharacterTypes.CHARACTER_INVENTORY_ADD]: characterInventoryAddHandler,
  [EventCharacterTypes.CHARACTER_INVENTORY_UPDATE]: characterInventoryUpdateHandler,
  [EventCharacterTypes.CHARACTER_INVENTORY_ITEM_ADD]: characterInventoryItemAddHandler,
  [EventCharacterTypes.CHARACTER_INVENTORY_ITEM_DELETE]: characterInventoryItemDeleteHandler,
  [EventCharacterTypes.CHARACTER_INVENTORY_ITEM_EDIT]: characterInventoryItemEditHandler,
};



export class EventCharacterExecuter extends GameEventExecuter {
  public async executeEvent(event: EventCharacterBase, triggerer: Participant, currentSession: GameSession) {
    const targetParticipant = currentSession.participants.find(p => p.type === 'player' && p.character.id === event.characterId);
    if (!targetParticipant || targetParticipant.type !== 'player') {
      throw new Error('Target character not found in the current game session');
    }

    const participantIndex = currentSession.participants.findIndex(p => p.id === targetParticipant.id);
    if (participantIndex === -1) {
      throw new Error('Target participant not found in the current game session');
    }

    const handler = EventCharacterMapper[event.type as EventCharacterTypes];
    if (!handler) {
      throw new Error(`No handler found for event type: ${event.type}`);
    }
    (handler as GameEventHandlerFn<EventCharacterBase>)(event, currentSession);

    
    await this.mongoClient.updateGameSession(currentSession.id, currentSession.version || 0, currentSession);


    const targetCharacter = triggerer.type === 'player' ? null : targetParticipant.character;
    if (!targetCharacter) {
      throw new Error('Target character not found for event notification');
    }
    const computedEvent: EventCharacterComputed<EventCharacterBase> = { ...event, targetCharacter, triggerer}

    await this.socketServerService.notifySessionUpdate(computedEvent);
    return computedEvent;
  }
}


