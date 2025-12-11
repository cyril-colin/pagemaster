import { Item } from './items.types';

export type LootBoxItem = {
  item: Item;
  claimedByPlayerId: string | null;
};

export type LootBox = {
  id: string;
  timestamp: number;
  items: LootBoxItem[];
};