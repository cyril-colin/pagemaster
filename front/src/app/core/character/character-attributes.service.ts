import { Injectable } from '@angular/core';
import { Character, GameDef } from '@pagemaster/common/pagemaster.types';
import { Bar } from './bars/bars-control.component';
import { Inventory } from './inventories/inventory.types';

@Injectable({
  providedIn: 'root',
})
export class CharacterAttributesService {
  
  public mapPlayerBars(character: Character, gameDef: GameDef): Bar[] {
    const characterPlayerRefs = character.attributes.bar;
    const possibleBars = gameDef.possibleAttributes.bar;

    return possibleBars.map(barDef => {
      const matchingInstance = characterPlayerRefs.find(b => b.id === barDef.id);
      return {
        def: barDef,
        instance: matchingInstance || { id: barDef.id, current: barDef.min },
        selected: !!matchingInstance,
      };
    });
  }





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
