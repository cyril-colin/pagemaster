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
  FURNITURE = 'FURNITURE',
  FOOD = 'FOOD',
  MEDICAL = 'MEDICAL',
  ELECTRONICS = 'ELECTRONICS',
  MATERIAL = 'MATERIAL',
  DECORATION = 'DECORATION',
}

export enum ItemRarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY',
}


export type ItemFilter<T> = {
  id: T,
  label: string,
}

export const ItemTagFilters: Record<ItemTag, ItemFilter<ItemTag>> = {
  [ItemTag.MISC]: {
    id: ItemTag.MISC,
    label: 'Miscellaneous',
  },
  [ItemTag.WEAPON_RANGED]: {
    id: ItemTag.WEAPON_RANGED,
    label: 'Ranged Weapon',
  },
  [ItemTag.WEAPON_MELEE]: {
    id: ItemTag.WEAPON_MELEE,
    label: 'Melee Weapon',
  },
  [ItemTag.CLOTHING]: {
    id: ItemTag.CLOTHING,
    label: 'Clothing',
  },
  [ItemTag.ARMOR]: {
    id: ItemTag.ARMOR,
    label: 'Armor',
  },
  [ItemTag.AMMO]: {
    id: ItemTag.AMMO,
    label: 'Ammunition',
  },
  [ItemTag.TOOL]: {
    id: ItemTag.TOOL,
    label: 'Tool',
  },
  [ItemTag.CONTAINER]: {
    id: ItemTag.CONTAINER,
    label: 'Container',
  },
  [ItemTag.FURNITURE]: {
    id: ItemTag.FURNITURE,
    label: 'Furniture',
  },
  [ItemTag.FOOD]: {
    id: ItemTag.FOOD,
    label: 'Food',
  },
  [ItemTag.MEDICAL]: {
    id: ItemTag.MEDICAL,
    label: 'Medical',
  },
  [ItemTag.ELECTRONICS]: {
    id: ItemTag.ELECTRONICS,
    label: 'Electronics',
  },
  [ItemTag.MATERIAL]: {
    id: ItemTag.MATERIAL,
    label: 'Material',
  },
  [ItemTag.DECORATION]: {
    id: ItemTag.DECORATION,
    label: 'Decoration',
  },
} as const;

export const ItemRarityFilters: Record<ItemRarity, ItemFilter<ItemRarity>> = {
  [ItemRarity.COMMON]: {
    id: ItemRarity.COMMON,
    label: 'Common',
  },
  [ItemRarity.UNCOMMON]: {
    id: ItemRarity.UNCOMMON,
    label: 'Uncommon',
  },
  [ItemRarity.RARE]: {
    id: ItemRarity.RARE,
    label: 'Rare',
  },
  [ItemRarity.EPIC]: {
    id: ItemRarity.EPIC,
    label: 'Epic',
  },
  [ItemRarity.LEGENDARY]: {
    id: ItemRarity.LEGENDARY,
    label: 'Legendary',
  },
} as const;
