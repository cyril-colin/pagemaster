import { AttributeBar, AttributeInventory, AttributeStatus } from './attributes.types';
import { EventPlayerBase } from './events.types';
import { Item } from './items.types';

export enum EventPlayerTypes {
  PLAYER_DESCRIPTION_EDIT = 'player.description.edit',
  PLAYER_AVATAR_EDIT = 'player.avatar.edit',
  PLAYER_NAME_EDIT = 'player.name.edit',
  PLAYER_BAR_ADD = 'player.bar.add',
  PLAYER_BAR_EDIT = 'player.bar.edit',
  PLAYER_BAR_DELETE = 'player.bar.delete',
  PLAYER_STATUS_ADD = 'player.status.add',
  PLAYER_STATUS_EDIT = 'player.status.edit',
  PLAYER_STATUS_DELETE = 'player.status.delete',
  PLAYER_INVENTORY_DELETE = 'player.inventory.delete',
  PLAYER_INVENTORY_ADD = 'player.inventory.add',
  PLAYER_INVENTORY_UPDATE = 'player.inventory.update',
  PLAYER_INVENTORY_ITEM_ADD = 'player.inventory.item.add',
  PLAYER_INVENTORY_ITEM_EDIT = 'player.inventory.item.edit',
  PLAYER_INVENTORY_ITEM_DELETE = 'player.inventory.item.delete',
}

export function isEventPlayerType(value: string): value is EventPlayerTypes {
  return Object.values(EventPlayerTypes).includes(value as EventPlayerTypes);
}

export type EventPlayerDescriptionEdit = EventPlayerBase & {
  type: EventPlayerTypes.PLAYER_DESCRIPTION_EDIT,
  newDescription: string,
}

export type EventPlayerNameEdit = EventPlayerBase & {
  type: EventPlayerTypes.PLAYER_NAME_EDIT,
  newName: string,
}

export type EventPlayerAvatarEdit = EventPlayerBase & {
  type: EventPlayerTypes.PLAYER_AVATAR_EDIT,
  newAvatar: string,
}


export type EventPlayerInventoryBase = EventPlayerBase & {
  type: EventPlayerTypes,
}

export type EventPlayerInventoryDelete = EventPlayerInventoryBase & {
  type: EventPlayerTypes.PLAYER_INVENTORY_DELETE,
  inventoryId: string,
}

export type EventPlayerInventoryAdd = EventPlayerInventoryBase & {
  type: EventPlayerTypes.PLAYER_INVENTORY_ADD,
  newInventory: Omit<AttributeInventory, 'id'>,
}

export type EventPlayerInventoryUpdate = EventPlayerInventoryBase & {
  type: EventPlayerTypes.PLAYER_INVENTORY_UPDATE,
  newInventory: AttributeInventory,
}

export type EventPlayerInventoryItemAdd = EventPlayerInventoryBase & {
  type: EventPlayerTypes.PLAYER_INVENTORY_ITEM_ADD,
  inventoryId: string,
  newItem: Omit<Item, 'id'>,
}

export type EventPlayerInventoryItemEdit = EventPlayerInventoryBase & {
  type: EventPlayerTypes.PLAYER_INVENTORY_ITEM_EDIT,
  inventoryId: string,
  newItem: Item,
}

export type EventPlayerInventoryItemDelete = EventPlayerInventoryBase & {
  type: EventPlayerTypes.PLAYER_INVENTORY_ITEM_DELETE,
  inventoryId: string,
  itemId: string,
}

export type EventPlayerBarAdd = EventPlayerBase & {
  type: EventPlayerTypes.PLAYER_BAR_ADD,
  newBar: Omit<AttributeBar, 'id'>,
}

export type EventPlayerBarEdit = EventPlayerBase & {
  type: EventPlayerTypes.PLAYER_BAR_EDIT,
  newBar: AttributeBar,
}

export type EventPlayerBarDelete = EventPlayerBase & {
  type: EventPlayerTypes.PLAYER_BAR_DELETE,
  barId: string,
}

export type EventPlayerStatusAdd = EventPlayerBase & {
  type: EventPlayerTypes.PLAYER_STATUS_ADD,
  newStatus: Omit<AttributeStatus, 'id'>,
}

export type EventPlayerStatusEdit = EventPlayerBase & {
  type: EventPlayerTypes.PLAYER_STATUS_EDIT,
  newStatus: AttributeStatus,
}

export type EventPlayerStatusDelete = EventPlayerBase & {
  type: EventPlayerTypes.PLAYER_STATUS_DELETE,
  statusId: string,
}