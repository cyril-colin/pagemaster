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
import { InventoryListViewComponent } from './inventories/inventory-list-view.component';
import { Inventory } from './inventories/inventory.types';
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
        <app-picture-control [picture]="form().controls.picture.value" (newPicture)="avatarEvent.emit($event)"/>
        <div class="identity-data">
          <app-name-control [name]="form().controls.name.value" (newName)="renameEvent.emit($event)"/>
          <app-description-control [description]="form().controls.description.value" (newDescription)="descriptionEvent.emit($event)"/>
        </div>
      </section>
      
      <app-bars-control [bars]="playerBars()" (newBars)="barsEvent.emit($event)"/>
      <app-status-control [statuses]="playerStatuses()" (newStatuses)="statusesEvent.emit($event)"/>

      <app-inventory-list-view
        [inventories]="playerInventories()"
        [character]="existingCharacter()"
        (updatedInventory)="setNewInventory($event)"
        (deleteInventory)="deleteInventory($event)"
      />

      <app-strengths-control [strengths]="playerStrengths()" (newStrengths)="strengthsEvent.emit($event)"/>
      <app-weaknesses-control [weaknesses]="playerWeaknesses()" (newWeaknesses)="weaknessesEvent.emit($event)"/>
      <app-skills-control [skills]="playerSkills()" (newSkills)="skillsEvent.emit($event)"/>
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
  public renameEvent = output<{value: string}>();
  public avatarEvent = output<{value: string}>();
  public descriptionEvent = output<{value: string}>();
  public barsEvent = output<Bar[]>();
  public statusesEvent = output<Status[]>();
  public strengthsEvent = output<Strength[]>();
  public weaknessesEvent = output<Weakness[]>();
  public skillsEvent = output<Skill[]>();
  public inventoriesEvent = output<Attributes['inventory']['instance'][]>();

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

    this.inventoriesEvent.emit(currentInventories);
  }

  protected deleteInventory(inventory: Inventory): void {
    const currentInventories = this.form().controls.attributes.controls.inventory.value;
    const updatedInventories = currentInventories.filter(inv => inv.id !== inventory.instance.id);
    this.inventoriesEvent.emit(updatedInventories);
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