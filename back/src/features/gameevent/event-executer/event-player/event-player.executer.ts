import { HttpForbiddenError, HttpNotFoundError } from '../../../../core/router/http-errors';
import { EventPlayerTypes } from '../../../../pagemaster-schemas/src/events-player.types';
import { EventPlayerBase } from '../../../../pagemaster-schemas/src/events.types';
import { GameMaster, GameSession, Player } from '../../../../pagemaster-schemas/src/pagemaster.types';
import { GameEventExecuter, GameEventHandlerFn } from '../event-executer';
import { playerAvatarEditHandler } from './handlers/player-avatar-edit.handler';
import { playerBarAddHandler } from './handlers/player-bar-add.handler';
import { playerBarDeleteHandler } from './handlers/player-bar-delete.handler';
import { playerBarEditHandler } from './handlers/player-bar-edit.handler';
import { playerBarPointAddHandler } from './handlers/player-bar-point-add.handler';
import { playerBarPointRemoveHandler } from './handlers/player-bar-point-remove.handler';
import { playerDescriptionEditHandler } from './handlers/player-description-edit.handler';
import { playerInventoryAddHandler } from './handlers/player-inventory-add.handler';
import { playerInventoryDeleteHandler } from './handlers/player-inventory-delete.handler';
import { playerInventoryItemAddHandler } from './handlers/player-inventory-item-add.handler';
import { playerInventoryItemDeleteHandler } from './handlers/player-inventory-item-delete.handler';
import { playerInventoryItemEditHandler } from './handlers/player-inventory-item-edit.handler';
import { playerInventoryUpdateHandler } from './handlers/player-inventory-update.handler';
import { playerNameEditHandler } from './handlers/player-name-edit.handler';
import { playerStatusAddHandler } from './handlers/player-status-add.handler';
import { playerStatusDeleteHandler } from './handlers/player-status-delete.handler';
import { playerStatusEditHandler } from './handlers/player-status-edit.handler';



export const EventPlayerMapper = {
  [EventPlayerTypes.PLAYER_DESCRIPTION_EDIT]: playerDescriptionEditHandler,
  [EventPlayerTypes.PLAYER_NAME_EDIT]: playerNameEditHandler,
  [EventPlayerTypes.PLAYER_AVATAR_EDIT]: playerAvatarEditHandler,
  [EventPlayerTypes.PLAYER_BAR_ADD]: playerBarAddHandler,
  [EventPlayerTypes.PLAYER_BAR_EDIT]: playerBarEditHandler,
  [EventPlayerTypes.PLAYER_BAR_DELETE]: playerBarDeleteHandler,
  [EventPlayerTypes.PLAYER_STATUS_ADD]: playerStatusAddHandler,
  [EventPlayerTypes.PLAYER_STATUS_EDIT]: playerStatusEditHandler,
  [EventPlayerTypes.PLAYER_STATUS_DELETE]: playerStatusDeleteHandler,
  [EventPlayerTypes.PLAYER_INVENTORY_DELETE]: playerInventoryDeleteHandler,
  [EventPlayerTypes.PLAYER_INVENTORY_ADD]: playerInventoryAddHandler,
  [EventPlayerTypes.PLAYER_INVENTORY_UPDATE]: playerInventoryUpdateHandler,
  [EventPlayerTypes.PLAYER_INVENTORY_ITEM_ADD]: playerInventoryItemAddHandler,
  [EventPlayerTypes.PLAYER_INVENTORY_ITEM_DELETE]: playerInventoryItemDeleteHandler,
  [EventPlayerTypes.PLAYER_INVENTORY_ITEM_EDIT]: playerInventoryItemEditHandler,
  [EventPlayerTypes.PLAYER_BAR_POINT_ADD]: playerBarPointAddHandler,
  [EventPlayerTypes.PLAYER_BAR_POINT_REMOVE]: playerBarPointRemoveHandler,
};



export class EventPlayerExecuter extends GameEventExecuter {
  public async executeEvent(event: EventPlayerBase, triggerer: Player | GameMaster, currentSession: GameSession, currentParticipantId: string | null) {
    
    // Generate event ID if not provided
    if (!event.id) {
      event.id = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    }

    const targetPlayer = currentSession.players.find(p => p.id === event.playerId);
    if (!targetPlayer) {
      throw new Error('Target player not found in the current game session');
    }

    const handler = EventPlayerMapper[event.type as EventPlayerTypes];
    if (!handler) {
      throw new Error(`No handler found for event type: ${event.type}`);
    }
    (handler as GameEventHandlerFn<EventPlayerBase>)(event, currentSession, currentParticipantId);


    event.timestamp = Date.now();

    return {event, newGameSession: currentSession};
  }
}

export function assertGameMaster(currentSession: GameSession, currentParticipantId: string | null): void   {
  if (currentParticipantId !== currentSession.master.id) {
    throw new HttpForbiddenError('Forbidden: Only the game master can execute command events');
  }
}

export function assertPlayerExists(currentSession: GameSession, playerId: string | null): Player {
  const player = currentSession.players.find(p => p.id === playerId);
  if (!player) {
    throw new HttpNotFoundError('Player not found in game session');
  }
  return player
}

export function assertAttributeIndex(player: Player, attributeName: keyof Player['attributes'], attributeId: string): number {
  const index = player.attributes[attributeName].findIndex(s => s.id === attributeId);
  if (index === -1) {
    throw new Error(`Attribute not found for update: ${attributeName} with ID ${attributeId}`);
  }
  return index;
}


