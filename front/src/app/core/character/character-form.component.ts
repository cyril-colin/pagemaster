import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output, Signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Character, GameDef } from '@pagemaster/common/pagemaster.types';
import { ITEM_ICONS } from '../gallery/item-icons.const';
import { PictureControlComponent } from './avatar/picture-control.component';
import { Bar, BarsControlComponent } from './bars/bars-control.component';
import { CharacterAttributesService } from './character-attributes.service';
import { DescriptionControlComponent } from './descriptions/description-control.component';
import { InventoryItemEvent, InventoryListComponent, InventorySelectionEvent } from './inventories/inventory-list.component';
import { Inventory } from './inventories/inventory.types';
import { NameControlComponent } from './names/name-control.component';
import { Skill, SkillsControlComponent } from './skills/skills-control.component';
import { Status, StatusControlComponent } from './statuses/status-control.component';
import { Strength, StrengthsControlComponent } from './strengths/strengths-control.component';
import { Weakness, WeaknessesControlComponent } from './weaknesses/weaknesses-control.component';



@Component({
  selector: 'app-character-form',
  template: `
    <form>
      <section class="identity">
        <app-picture-control [picture]="existingCharacter().picture" (newPicture)="avatarEvent.emit($event)"/>
        <div class="identity-data">
          <app-name-control [name]="existingCharacter().name" (newName)="renameEvent.emit($event)"/>
          <app-description-control [description]="existingCharacter().description" (newDescription)="descriptionEvent.emit($event)"/>
        </div>
      </section>
      
      <app-bars-control [bars]="playerBars()" (newBars)="barsEvent.emit($event)"/>
      <app-status-control [statuses]="playerStatuses()" (newStatuses)="statusesEvent.emit($event)"/>

      <app-inventory-list
        [inventories]="playerInventories()"
        [character]="existingCharacter()"
        (addItem)="addItem.emit($event)"
        (deleteItem)="deleteItem.emit($event)"
        (editItem)="editItem.emit($event)"
        (select)="select.emit($event)"
        (unselect)="unselect.emit($event)"
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
    InventoryListComponent,
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