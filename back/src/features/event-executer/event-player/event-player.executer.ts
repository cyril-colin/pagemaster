import { EventPlayerTypes } from '../../../pagemaster-schemas/src/events-player.types';
import { EventPlayerBase, EventPlayerComputed } from '../../../pagemaster-schemas/src/events.types';
import { GameMaster, GameSession, Player } from '../../../pagemaster-schemas/src/pagemaster.types';
import { GameEventExecuter, GameEventHandlerFn } from '../event-executer';
import { playerDescriptionEditHandler } from './handlers/player-description-edit.handler';
import { playerInventoryAddHandler } from './handlers/player-inventory-add.handler';
import { playerInventoryDeleteHandler } from './handlers/player-inventory-delete.handler';
import { playerInventoryItemAddHandler } from './handlers/player-inventory-item-add.handler';
import { playerInventoryItemDeleteHandler } from './handlers/player-inventory-item-delete.handler';
import { playerInventoryItemEditHandler } from './handlers/player-inventory-item-edit.handler';
import { playerInventoryUpdateHandler } from './handlers/player-inventory-update.handler';
import { playerNameEditHandler } from './handlers/player-name-edit.handler';



export const EventPlayerMapper = {
  [EventPlayerTypes.PLAYER_DESCRIPTION_EDIT]: playerDescriptionEditHandler,
  [EventPlayerTypes.PLAYER_NAME_EDIT]: playerNameEditHandler,
  [EventPlayerTypes.PLAYER_INVENTORY_DELETE]: playerInventoryDeleteHandler,
  [EventPlayerTypes.PLAYER_INVENTORY_ADD]: playerInventoryAddHandler,
  [EventPlayerTypes.PLAYER_INVENTORY_UPDATE]: playerInventoryUpdateHandler,
  [EventPlayerTypes.PLAYER_INVENTORY_ITEM_ADD]: playerInventoryItemAddHandler,
  [EventPlayerTypes.PLAYER_INVENTORY_ITEM_DELETE]: playerInventoryItemDeleteHandler,
  [EventPlayerTypes.PLAYER_INVENTORY_ITEM_EDIT]: playerInventoryItemEditHandler,
};



export class EventPlayerExecuter extends GameEventExecuter {
  public async executeEvent(event: EventPlayerBase, triggerer: Player | GameMaster, currentSession: GameSession) {
    const targetPlayer = currentSession.players.find(p => p.id === event.playerId);
    if (!targetPlayer) {
      throw new Error('Target player not found in the current game session');
    }

    const handler = EventPlayerMapper[event.type as EventPlayerTypes];
    if (!handler) {
      throw new Error(`No handler found for event type: ${event.type}`);
    }
    (handler as GameEventHandlerFn<EventPlayerBase>)(event, currentSession);

    
    await this.mongoClient.updateGameSession(currentSession.id, currentSession.version || 0, currentSession);


   
    const computedEvent: EventPlayerComputed<EventPlayerBase> = {
      ...event,
      targetPlayer,
      triggerer,
      timestamp: Date.now(),
    }

    await this.socketServerService.notifySessionUpdate(computedEvent);
    return computedEvent;
  }
}


