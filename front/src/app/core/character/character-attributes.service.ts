import { Injectable } from '@angular/core';
import { Character, GameDef } from '@pagemaster/common/pagemaster.types';
import { Bar } from './bars/bars-control.component';
import { Inventory } from './inventories/inventories-control.component';
import { Skill } from './skills/skills-control.component';
import { Status } from './statuses/status-control.component';
import { Strength } from './strengths/strengths-control.component';
import { Weakness } from './weaknesses/weaknesses-control.component';

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

  public mapPlayerStatuses(character: Character, gameDef: GameDef): Status[] {
    const characterPlayerRefs = character.attributes.status;
    const possibleStatuses = gameDef.possibleAttributes.status;

    return possibleStatuses.map(statusDef => {
      const matchingInstance = characterPlayerRefs.find(s => s.id === statusDef.id);
      return {
        definition: statusDef,
        instance: matchingInstance || { id: statusDef.id, current: '' },
        selected: !!matchingInstance,
      };
    });
  }

  public mapPlayerStrengths(character: Character, gameDef: GameDef): Strength[] {
    const characterPlayerRefs = character.attributes.strength;
    const possibleStrengths = gameDef.possibleAttributes.strength;

    return possibleStrengths.map(strengthDef => {
      const matchingInstance = characterPlayerRefs.find(s => s.id === strengthDef.id);
      return {
        def: strengthDef,
        instance: matchingInstance || { id: strengthDef.id },
        selected: !!matchingInstance,
      };
    });
  }

  public mapPlayerWeaknesses(character: Character, gameDef: GameDef): Weakness[] {
    const characterPlayerRefs = character.attributes.weakness;
    const possibleWeaknesses = gameDef.possibleAttributes.weakness;

    return possibleWeaknesses.map(weaknessDef => {
      const matchingInstance = characterPlayerRefs.find(w => w.id === weaknessDef.id);
      return {
        def: weaknessDef,
        instance: matchingInstance || { id: weaknessDef.id },
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
        instance: matchingInstance || { id: inventoryDef.id, current: [] },
        selected: !!matchingInstance,
      };
    });
  }

  public mapPlayerSkills(character: Character, gameDef: GameDef): Skill[] {
    const characterPlayerRefs = character.skills;
    const possibleSkills = gameDef.possibleSkills;

    return possibleSkills.map(skillDef => {
      const matchingInstance = characterPlayerRefs.find(s => s.id === skillDef.id);
      return {
        def: skillDef,
        instance: matchingInstance || { id: skillDef.id },
        selected: !!matchingInstance,
      };
    });
  }
}
