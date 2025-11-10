import { Item } from './items.types';

export type AbstractAttribute = {
  id: string,
  type: unknown,
};
export type AttributeBar = AbstractAttribute & {
  type: 'bar',
  color: string,
  name: string,
  min: number,
  max: number,
  current: number,
}

export type AttributeStatus = AbstractAttribute &  {
  type: 'status',
  color: string,
  name: string,
  description: string,
}

export type AttributeInventory = AbstractAttribute &  {
  type: 'inventory',
  name: string,
  capacity: 
    | {type: 'state', value: 'empty' | 'partial' | 'full'}
    | {type: 'weight', value: number, max: number},
  isSecret: boolean,
}

export type Attributes = {
  bar: AttributeBar,
  status: AttributeStatus,
  inventory: {definition: AttributeInventory, instance: { id: AttributeInventory['id'], current: Item[]}},
}

