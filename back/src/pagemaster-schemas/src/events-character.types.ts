import { AttributeInventory } from './attributes.types'
import { EventCharacterBase } from './events.types'
import { Item } from './items.types'

export enum EventCharacterTypes {
  CHARACTER_DESCRIPTION_EDIT = 'character.description.edit',
  CHARACTER_NAME_EDIT = 'character.name.edit',
  CHARACTER_INVENTORY_DELETE = 'character.inventory.delete',
  CHARACTER_INVENTORY_ADD = 'character.inventory.add',
  CHARACTER_INVENTORY_UPDATE = 'character.inventory.update',
  CHARACTER_INVENTORY_ITEM_ADD = 'character.inventory.item.add',
  CHARACTER_INVENTORY_ITEM_EDIT = 'character.inventory.item.edit',
  CHARACTER_INVENTORY_ITEM_DELETE = 'character.inventory.item.delete',
}

export type EventCharacterDescriptionEdit = EventCharacterBase & {
  type: EventCharacterTypes.CHARACTER_DESCRIPTION_EDIT,
  description: string,
}

export type EventCharacterNameEdit = EventCharacterBase & {
  type: EventCharacterTypes.CHARACTER_NAME_EDIT,
  name: string,
}


export type EventCharacterInventoryBase = EventCharacterBase & {
  type: EventCharacterTypes,
}

export type EventCharacterInventoryDelete = EventCharacterInventoryBase & {
  type: EventCharacterTypes.CHARACTER_INVENTORY_DELETE,
  inventoryId: string,
}

export type EventCharacterInventoryAdd = EventCharacterInventoryBase & {
  type: EventCharacterTypes.CHARACTER_INVENTORY_ADD,
  inventory: Omit<AttributeInventory, 'id'>,
}

export type EventCharacterInventoryUpdate = EventCharacterInventoryBase & {
  type: EventCharacterTypes.CHARACTER_INVENTORY_UPDATE,
  inventory: AttributeInventory,
}

export type EventCharacterInventoryItemAdd = EventCharacterInventoryBase & {
  type: EventCharacterTypes.CHARACTER_INVENTORY_ITEM_ADD,
  inventoryId: string,
  item: Omit<Item, 'id'>,
}

export type EventCharacterInventoryItemEdit = EventCharacterInventoryBase & {
  type: EventCharacterTypes.CHARACTER_INVENTORY_ITEM_EDIT,
  inventoryId: string,
  item: Item,
}

export type EventCharacterInventoryItemDelete = EventCharacterInventoryBase & {
  type: EventCharacterTypes.CHARACTER_INVENTORY_ITEM_DELETE,
  inventoryId: string,
  itemId: string,
}