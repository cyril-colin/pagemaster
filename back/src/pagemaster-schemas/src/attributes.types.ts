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

export const defaultBar: Record<string, AttributeBar> = {
  health: {
    id: 'id-health',
    type: 'bar',
    color: '#ff4d4d',
    name: 'Health',
    min: 0,
    max: 5,
    current: 5,
  },
  stamina: {
    id: 'id-stamina',
    type: 'bar',
    color: '#4d94ff',
    name: 'Stamina',
    min: 0,
    max: 5,
    current: 5,
  },
  mana: {
    id: 'id-mana',
    type: 'bar',
    color: '#b84dff',
    name: 'Mana',
    min: 0,
    max: 5,
    current: 5,
  },
  ammo: {
    id: 'id-ammo',
    type: 'bar',
    color: '#ffff4d',
    name: 'Ammo',
    min: 0,
    max: 30,
    current: 30,
  },
} as const;

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
  current: Item[],
}

export const defaultInventories: Record<string, AttributeInventory> = {
  equipment: {
    id: 'id-equipment',
    type: 'inventory',
    name: 'Equipment',
    capacity: { type: 'weight', value: 0, max: 5 },
    isSecret: false,
    current: [],
  },
  backpack: {
    id: 'id-backpack',
    type: 'inventory',
    name: 'Backpack',
    capacity: { type: 'weight', value: 0, max: 10 },
    isSecret: false,
    current: [],
  },
  pouch: {
    id: 'id-pouch',
    type: 'inventory',
    name: 'Pouch',
    capacity: { type: 'weight', value: 0, max: 10 },
    isSecret: false,
    current: [],
  },
}

