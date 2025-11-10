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
}

export type AttributeStrength = AbstractAttribute & {
  type: 'strength',
  name: string,
}
export type AttributeWeakness = AbstractAttribute & {
  type: 'weakness',
  name: string,
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
  bar: {definition: AttributeBar, instance: { id: AttributeBar['id'], current: number}},
  status: {definition: AttributeStatus, instance: never},
  inventory: {definition: AttributeInventory, instance: { id: AttributeInventory['id'], current: Item[]}},
  strength: {definition: AttributeStrength, instance: { id: AttributeStrength['id']}},
  weakness: {definition: AttributeWeakness, instance: { id: AttributeWeakness['id']}},
}

