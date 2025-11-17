import { AttributeInventory } from './attributes.types'
import { EventPlayerBase } from './events.types'
import { Item } from './items.types'

export enum EventPlayerTypes {
  PLAYER_DESCRIPTION_EDIT = 'player.description.edit',
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
  description: string,
}

export type EventPlayerNameEdit = EventPlayerBase & {
  type: EventPlayerTypes.PLAYER_NAME_EDIT,
  name: string,
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
  inventory: Omit<AttributeInventory, 'id'>,
}

export type EventPlayerInventoryUpdate = EventPlayerInventoryBase & {
  type: EventPlayerTypes.PLAYER_INVENTORY_UPDATE,
  inventory: AttributeInventory,
}

export type EventPlayerInventoryItemAdd = EventPlayerInventoryBase & {
  type: EventPlayerTypes.PLAYER_INVENTORY_ITEM_ADD,
  inventoryId: string,
  item: Omit<Item, 'id'>,
}

export type EventPlayerInventoryItemEdit = EventPlayerInventoryBase & {
  type: EventPlayerTypes.PLAYER_INVENTORY_ITEM_EDIT,
  inventoryId: string,
  item: Item,
}

export type EventPlayerInventoryItemDelete = EventPlayerInventoryBase & {
  type: EventPlayerTypes.PLAYER_INVENTORY_ITEM_DELETE,
  inventoryId: string,
  itemId: string,
}