import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output, Signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Character, GameDef } from '@pagemaster/common/pagemaster.types';
import { ITEM_ICONS } from '../gallery/item-icons.const';
import { AvatarPermissions, PictureControlComponent } from './avatar/picture-control.component';
import { Bar, BarsControlComponent, BarsPermissions } from './bars/bars-control.component';
import { CharacterAttributesService } from './character-attributes.service';
import { DescriptionControlComponent, DescriptionPermissions } from './descriptions/description-control.component';
import {
  InventoryItemEvent,
  InventoryListComponent,
  InventoryPermissions,
  InventorySelectionEvent,
} from './inventories/inventory-list.component';
import { Inventory } from './inventories/inventory.types';
import { NameControlComponent, NamePermissions } from './names/name-control.component';
import { Skill, SkillsControlComponent, SkillsPermissions } from './skills/skills-control.component';
import { Status, StatusControlComponent, StatusesPermissions } from './statuses/status-control.component';
import { Strength, StrengthsControlComponent, StrengthsPermissions } from './strengths/strengths-control.component';
import { Weakness, WeaknessesControlComponent, WeaknessesPermissions } from './weaknesses/weaknesses-control.component';


export type CharacterPermissions = {
  inventory: InventoryPermissions,
  avatar: AvatarPermissions,
  name: NamePermissions,
  description: DescriptionPermissions,
  bars: BarsPermissions,
  statuses: StatusesPermissions,
  strengths: StrengthsPermissions,
  weaknesses: WeaknessesPermissions,
  skills: SkillsPermissions,
}


@Component({
  selector: 'app-character-form',
  template: `
    <form>
      <section class="identity">
        <app-picture-control
          [picture]="existingCharacter().picture"
          [permissions]="permissions().avatar"
          (newPicture)="avatarEvent.emit($event)"
        />
        <div class="identity-data">
          <app-name-control
            [name]="existingCharacter().name"
            [permissions]="permissions().name"
            (newName)="renameEvent.emit($event)"
          />
          <app-description-control
            [description]="existingCharacter().description"
            [permissions]="permissions().description"
            (newDescription)="descriptionEvent.emit($event)"
          />
        </div>
      </section>
      
      <app-bars-control
        [bars]="playerBars()"
        [permissions]="permissions().bars"
        (newBars)="barsEvent.emit($event)"
      />
      <app-status-control
        [statuses]="playerStatuses()"
        [permissions]="permissions().statuses"
        (newStatuses)="statusesEvent.emit($event)"
      />

      <app-inventory-list
        [inventories]="playerInventories()"
        [character]="existingCharacter()"
        [permissions]="permissions().inventory"
        (addItem)="addItem.emit($event)"
        (deleteItem)="deleteItem.emit($event)"
        (editItem)="editItem.emit($event)"
        (select)="select.emit($event)"
        (unselect)="unselect.emit($event)"
      />

      <app-strengths-control
        [strengths]="playerStrengths()"
        [permissions]="permissions().strengths"
        (newStrengths)="strengthsEvent.emit($event)"
      />
      <app-weaknesses-control
        [weaknesses]="playerWeaknesses()"
        [permissions]="permissions().weaknesses"
        (newWeaknesses)="weaknessesEvent.emit($event)"
      />
      <app-skills-control
        [skills]="playerSkills()"
        [permissions]="permissions().skills"
        (newSkills)="skillsEvent.emit($event)"
      />
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
    InventoryListComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharacterFormComponent  {
  protected ITEM_ICONS = ITEM_ICONS;
  public existingCharacter = input.required<Character>();
  public gameDef = input.required<GameDef>();
  public permissions = input.required<CharacterPermissions>();
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
  public deleteItem = output<InventoryItemEvent>();
  public editItem = output<InventoryItemEvent>();
  public addItem = output<InventoryItemEvent>();
  public select = output<InventorySelectionEvent>();
  public unselect = output<InventorySelectionEvent>();

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
}