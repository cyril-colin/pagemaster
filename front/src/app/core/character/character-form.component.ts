import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output, Signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Attributes } from '@pagemaster/common/attributes.types';
import { Character, GameDef } from '@pagemaster/common/pagemaster.types';
import { SkillInstance } from '@pagemaster/common/skills.types';
import { ITEM_ICONS } from '../gallery/item-icons.const';
import { PictureControlComponent } from './avatar/picture-control.component';
import { Bar, BarsControlComponent } from './bars/bars-control.component';
import { CharacterAttributesService } from './character-attributes.service';
import { DescriptionControlComponent } from './descriptions/description-control.component';
import { Inventory } from './inventories/inventories-control.component';
import { InventoryListViewComponent } from './inventories/inventory-list-view.component';
import { NameControlComponent } from './names/name-control.component';
import { Skill, SkillsControlComponent } from './skills/skills-control.component';
import { Status, StatusControlComponent } from './statuses/status-control.component';
import { Strength, StrengthsControlComponent } from './strengths/strengths-control.component';
import { Weakness, WeaknessesControlComponent } from './weaknesses/weaknesses-control.component';

type AttributeType = {
    bar: FormControl<Attributes['bar']['instance'][]>,
    status: FormControl<Attributes['status']['instance'][]>,
    inventory: FormControl<Attributes['inventory']['instance'][]>,
    strength: FormControl<Attributes['strength']['instance'][]>,
    weakness: FormControl<Attributes['weakness']['instance'][]>,
  }

type CharacterFormType = {
  name: FormControl<string>,
  description: FormControl<string>,
  picture: FormControl<string>,
  attributes: FormGroup<AttributeType>,
  skills: FormControl<SkillInstance[]>,
}

@Component({
  selector: 'app-character-form',
  template: `
    <form [formGroup]="form()">
      <section class="identity">
        <app-picture-control [picture]="form().controls.picture.value" (newPicture)="setNewPicture($event)"/>
        <div class="identity-data">
          <app-name-control [name]="form().controls.name.value" (newName)="setNewName($event)"/>
          <app-description-control [description]="form().controls.description.value" (newDescription)="setNewDescription($event)"/>
        </div>
      </section>
      
      <app-bars-control [bars]="playerBars()" (newBars)="setNewBars($event)"/>
      <app-status-control [statuses]="playerStatuses()" (newStatuses)="setNewStatuses($event)"/>

      <app-inventory-list-view
        [inventories]="playerInventories()"
        [character]="existingCharacter()"
        (updatedInventory)="setNewInventory($event)"
        (deleteInventory)="deleteInventory($event)"
      />

      <app-strengths-control [strengths]="playerStrengths()" (newStrengths)="setNewStrengths($event)"/>
      <app-weaknesses-control [weaknesses]="playerWeaknesses()" (newWeaknesses)="setNewWeaknesses($event)"/>
      <app-skills-control [skills]="playerSkills()" (newSkills)="setNewSkills($event)"/>
    </form>
  `,
  styles: [`
    form {

      .identity {
        display: flex;
        flex-direction: row;
        gap: 8px;

        .identity-data {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
      }
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    `],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NameControlComponent,
    PictureControlComponent,
    DescriptionControlComponent,
    BarsControlComponent,
    StatusControlComponent,
    StrengthsControlComponent,
    WeaknessesControlComponent,
    SkillsControlComponent,
    InventoryListViewComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharacterFormComponent  {
  protected ITEM_ICONS = ITEM_ICONS;
  public existingCharacter = input.required<Character>();
  public gameDef = input.required<GameDef>();
  public newCharacter = output<Character>();
  public fb = inject(FormBuilder);
  private characterAttributesService = inject(CharacterAttributesService);

  protected playerBars = computed(() => {
    return this.characterAttributesService.mapPlayerBars(
      this.existingCharacter(),
      this.gameDef(),
    );
  });

  protected playerStatuses = computed(() => {
    return this.characterAttributesService.mapPlayerStatuses(
      this.existingCharacter(),
      this.gameDef(),
    );
  });

  protected playerStrengths = computed(() => {
    return this.characterAttributesService.mapPlayerStrengths(
      this.existingCharacter(),
      this.gameDef(),
    );
  });

  protected playerWeaknesses = computed(() => {
    return this.characterAttributesService.mapPlayerWeaknesses(
      this.existingCharacter(),
      this.gameDef(),
    );
  });

  protected playerInventories: Signal<Inventory[]> = computed(() => {
    return this.characterAttributesService.mapPlayerInventories(
      this.existingCharacter(),
      this.gameDef(),
    );
  });

  protected playerSkills = computed(() => {
    return this.characterAttributesService.mapPlayerSkills(
      this.existingCharacter(),
      this.gameDef(),
    );
  });
  
  protected form = computed(() => {
    const existingValue = this.existingCharacter();
    return this.fb.group<CharacterFormType>(this.defaultFormValue(existingValue));
  });

  protected setNewName(name: {value: string}): void {
    this.form().controls.name.setValue(name.value);
    this.submit();
  }

  protected setNewDescription(description: {value: string}): void {
    this.form().controls.description.setValue(description.value);
    this.submit();
  }

  protected setNewPicture(picture: {value: string}): void {
    this.form().controls.picture.setValue(picture.value);
    this.submit();
  }

  protected setNewStrengths(strengths: Strength[]): void {
    const selectedStrengths = strengths.filter(s => s.selected).map(s => s.instance);
    this.form().controls.attributes.controls.strength.setValue(selectedStrengths);
    this.submit();
  }

  protected setNewWeaknesses(weaknesses: Weakness[]): void {
    const selectedWeaknesses = weaknesses.filter(w => w.selected).map(w => w.instance);
    this.form().controls.attributes.controls.weakness.setValue(selectedWeaknesses);
    this.submit();
  } 

  protected setNewBars(bars: Bar[]): void {
    const selectedBars = bars.filter(b => b.selected).map(b => b.instance);
    this.form().controls.attributes.controls.bar.setValue(selectedBars);
    this.submit();
  }

  protected setNewStatuses(statuses: Status[]): void {
    const selectedStatuses = statuses.filter(s => s.selected).map(s => s.instance);
    this.form().controls.attributes.controls.status.setValue(selectedStatuses);
    this.submit();
  }

  protected setNewInventories(inventories: Inventory[]): void {
    const selectedInventories = inventories.filter(i => i.selected).map(i => i.instance);
    this.form().controls.attributes.controls.inventory.setValue(selectedInventories);
    this.submit();
  }

  protected setNewInventory(inventory: Inventory): void {
    const currentInventories = this.form().controls.attributes.controls.inventory.value;
    const inventoryToEditIndex = currentInventories.findIndex(inv => inv.id === inventory.instance.id);
    if (inventoryToEditIndex === -1) {
      currentInventories.push(inventory.instance);
    } else {
      currentInventories[inventoryToEditIndex] = inventory.instance;
    }


    this.form().controls.attributes.controls.inventory.setValue(currentInventories);
    this.submit();
  }

  protected deleteInventory(inventory: Inventory): void {
    const currentInventories = this.form().controls.attributes.controls.inventory.value;
    const updatedInventories = currentInventories.filter(inv => inv.id !== inventory.instance.id);
    this.form().controls.attributes.controls.inventory.setValue(updatedInventories);
    this.submit();
  }

  protected setNewSkills(skills: Skill[]): void {
    const selectedSkills = skills.filter(s => s.selected).map(s => s.instance);
    this.form().controls.skills.setValue(selectedSkills);
    this.submit();
  }

  private defaultFormValue(character: Character): CharacterFormType {
    return {
      name: this.fb.control(character.name, { nonNullable: true, validators: [Validators.required] }),
      description: this.fb.control(character.description, { nonNullable: true }),
      picture: this.fb.control(character.picture, { nonNullable: true }),
      attributes: this.fb.group<AttributeType>({
        bar: this.fb.control(character.attributes.bar, { nonNullable: true }),
        status: this.fb.control(character.attributes.status, { nonNullable: true }),
        inventory: this.fb.control(character.attributes.inventory, { nonNullable: true }),
        strength: this.fb.control(character.attributes.strength, { nonNullable: true }),
        weakness: this.fb.control(character.attributes.weakness, { nonNullable: true }),
      }),
      skills: this.fb.control(character.skills, { nonNullable: true }),
    };
  }

  protected submit() {
    const formData = this.form().getRawValue();
    const character: Character = {id: `${formData.name}-${Date.now()}`, ...formData };
    this.newCharacter.emit(character);
  }
}