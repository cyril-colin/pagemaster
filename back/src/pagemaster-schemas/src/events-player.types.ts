import { AttributeInventory } from './attributes.types'
import { EventPlayerBase } from './events.types'
import { Item } from './items.types'

export enum EventPlayerTypes {
  PLAYER_DESCRIPTION_EDIT = 'player.description.edit',
  PLAYER_AVATAR_EDIT = 'player.avatar.edit',
  PLAYER_NAME_EDIT = 'player.name.edit',
  PLAYER_INVENTORY_DELETE = 'player.inventory.delete',
  PLAYER_INVENTORY_ADD = 'player.inventory.add',
  PLAYER_INVENTORY_UPDATE = 'player.inventory.update',
  PLAYER_INVENTORY_ITEM_ADD = 'player.inventory.item.add',
  PLAYER_INVENTORY_ITEM_EDIT = 'player.inventory.item.edit',
  PLAYER_INVENTORY_ITEM_DELETE = 'player.inventory.item.delete',
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