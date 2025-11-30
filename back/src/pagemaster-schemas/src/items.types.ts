export type Item = {
  id: string,
  /**
   * The displayed name of the item
   * 
   * should be human readable and as short as possible
   */
  name: string,
  /**
   * Used to load the asset but also as a reference to retrieve the 
   * matching ItemAsset.
   */
  path: string,
  /**
   * Used to filter items by their tags
   */
  tags: ItemTag[],
  /**
   * define how rare the item is.
   */
  rarity: ItemRarity,
  /**
   * Weight of the item, according to an inventory's weight unit.
   */
  weight: number,
}

export type ItemAsset = {
  /**
   * Path to the asset file
   * relative to the /public folder
   */
  path: string,
  type: 'item',
  /**
   * Where the asset came from, in order to credit the creator properly.
   */
  origin: string,
  size: {
    /**
     * Original size of the asset
     * in pixels
     */
    height: number,
    /**
     * Original size of the asset
     * in pixels
     */
    width: number,
  },
}

export enum ItemTag {
  MISC = 'MISC',
  WEAPON_RANGED = 'WEAPON_RANGED',
  WEAPON_MELEE ='WEAPON_MELEE',
  CLOTHING = 'CLOTHING',
  ARMOR = 'ARMOR',
  AMMO = 'AMMO',
  TOOL = 'TOOL',
  CONTAINER = 'CONTAINER',
  BOOK = 'BOOK',
  FURNITURE = 'FURNITURE',
  FOOD = 'FOOD',
  MEDICAL = 'MEDICAL',
  ELECTRONICS = 'ELECTRONICS',
  MATERIAL = 'MATERIAL',
  DECORATION = 'DECORATION',
}

export enum ItemRarity {
  NEVER = 'NEVER',
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
}


export type ItemFilter<T> = {
  id: T,
  label: string,
  /**
   * The higher the value, the higher in the list the filter will appear
   */
  sortValue: number,
}

export const ItemTagFilters: Record<ItemTag, ItemFilter<ItemTag>> = {
  [ItemTag.MISC]: {
    id: ItemTag.MISC,
    label: 'Miscellaneous',
    sortValue: 0,
  },
  [ItemTag.BOOK]: {
    id: ItemTag.BOOK,
    label: 'Book',
    sortValue: 0,
  },
  [ItemTag.WEAPON_RANGED]: {
    id: ItemTag.WEAPON_RANGED,
    label: 'Ranged Weapon',
    sortValue: 100,
  },
  [ItemTag.WEAPON_MELEE]: {
    id: ItemTag.WEAPON_MELEE,
    label: 'Melee Weapon',
    sortValue: 90,
  },
  [ItemTag.CLOTHING]: {
    id: ItemTag.CLOTHING,
    label: 'Clothing',
    sortValue: 85,
  },
  [ItemTag.ARMOR]: {
    id: ItemTag.ARMOR,
    label: 'Armor',
    sortValue: 80,
  },
  [ItemTag.AMMO]: {
    id: ItemTag.AMMO,
    label: 'Ammunition',
    sortValue: 75,
  },
  [ItemTag.TOOL]: {
    id: ItemTag.TOOL,
    label: 'Tool',
    sortValue: 0,
  },
  [ItemTag.CONTAINER]: {
    id: ItemTag.CONTAINER,
    label: 'Container',
    sortValue: 50,
  },
  [ItemTag.FURNITURE]: {
    id: ItemTag.FURNITURE,
    label: 'Furniture',
    sortValue: 40, 
  },
  [ItemTag.FOOD]: {
    id: ItemTag.FOOD,
    label: 'Food',
    sortValue: 76,
  },
  [ItemTag.MEDICAL]: {
    id: ItemTag.MEDICAL,
    label: 'Medical',
    sortValue: 75,
  },
  [ItemTag.ELECTRONICS]: {
    id: ItemTag.ELECTRONICS,
    label: 'Electronics',
    sortValue: 45,
  },
  [ItemTag.MATERIAL]: {
    id: ItemTag.MATERIAL,
    label: 'Material',
    sortValue: 35,
  },
  [ItemTag.DECORATION]: {
    id: ItemTag.DECORATION,
    label: 'Decoration',
    sortValue: 0,
  },
} as const;

export const ItemRarityFilters: Record<ItemRarity, ItemFilter<ItemRarity>> = {
  [ItemRarity.COMMON]: {
    id: ItemRarity.COMMON,
    label: 'Common',
    sortValue: 30,
  },
  [ItemRarity.UNCOMMON]: {
    id: ItemRarity.UNCOMMON,
    label: 'Uncommon',
    sortValue: 50,
  },
  [ItemRarity.RARE]: {
    id: ItemRarity.RARE,
    label: 'Rare',
    sortValue: 70,
  },
  [ItemRarity.EPIC]: {
    id: ItemRarity.EPIC,
    label: 'Epic',
    sortValue: 80,
  },
  [ItemRarity.LEGENDARY]: {
    id: ItemRarity.LEGENDARY,
    label: 'Legendary',
    sortValue: 100,
  },
  [ItemRarity.NEVER]: {
    id: ItemRarity.NEVER,
    label: 'Never',
    sortValue: 0,
  },
} as const;
