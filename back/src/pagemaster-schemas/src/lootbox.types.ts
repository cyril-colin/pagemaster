import { Item } from './items.types';
import { Player } from './pagemaster.types';
export type LootBox = {
  id: string;
  timestamp: number;
  items: {item: Item, player: Player | null}[]
};