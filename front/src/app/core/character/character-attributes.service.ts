import { Injectable } from '@angular/core';
import { Character, GameDef } from '@pagemaster/common/pagemaster.types';
import { Inventory } from './inventories/inventory.types';

@Injectable({
  providedIn: 'root',
})
export class CharacterAttributesService {
  public mapPlayerInventories(character: Character, gameDef: GameDef): Inventory[] {
    const characterPlayerRefs = character.attributes.inventory;
    const possibleInventories = gameDef.possibleAttributes.inventory;

    return possibleInventories.map(inventoryDef => {
      const matchingInstance = characterPlayerRefs.find(i => i.id === inventoryDef.id);
      return {
        def: inventoryDef,
        instance: matchingInstance || { id: '', current: [] },
        selected: !!matchingInstance,
      };
    });
  }

}
