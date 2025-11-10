import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output, Signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AttributeStatus } from '@pagemaster/common/attributes.types';
import { Character, GameDef } from '@pagemaster/common/pagemaster.types';
import { CardComponent } from '../design-system/card.component';
import { ITEM_ICONS } from '../gallery/item-icons.const';
import { AvatarEvent, AvatarPermissions, PictureControlComponent } from './avatar/picture-control.component';
import { Bar, BarsControlComponent, BarsPermissions } from './bars/bars-control.component';
import { CharacterAttributesService } from './character-attributes.service';
import { DescriptionControlComponent, DescriptionPermissions } from './descriptions/description-control.component';
import {
  InventoryAdditionEvent,
  InventoryListComponent,
  InventoryListPermissions,
} from './inventories/inventory-list.component';
import { InventoryDeletionEvent, InventoryItemEvent } from './inventories/inventory.component';
import { Inventory } from './inventories/inventory.types';
import { NameControlComponent, NamePermissions } from './names/name-control.component';
import { StatusControlComponent, StatusesPermissions } from './statuses/status-control.component';


export type CharacterPermissions = {
  inventory: InventoryListPermissions,
  avatar: AvatarPermissions,
  name: NamePermissions,
  description: DescriptionPermissions,
  bars: BarsPermissions,
  statuses: StatusesPermissions,
}


@Component({
  selector: 'app-character-form',
  template: `
    <form>
      <ds-card>
        <div class="identity">
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
        </div>
        <app-bars-control
          [bars]="playerBars()"
          [permissions]="permissions().bars"
          (newBars)="barsEvent.emit($event)"
        />
      </ds-card>

      <app-status-control
        [statuses]="existingCharacter().attributes.status"
        [permissions]="permissions().statuses"
        (newStatus)="newStatusEvent.emit($event)"
        (editStatus)="editStatusEvent.emit($event)"
        (deleteStatus)="deleteStatusEvent.emit($event)"
      />
      <app-inventory-list
        [inventories]="playerInventories()"
        [character]="existingCharacter()"
        [permissions]="permissions().inventory"
        (addItem)="addItem.emit($event)"
        (deleteItem)="deleteItem.emit($event)"
        (editItem)="editItem.emit($event)"
        (addInventory)="addInventory.emit($event)"
        (deleteInventory)="deleteInventory.emit($event)"
      />
    </form>
  `,
  styles: [`
    form {
      display: flex;
      flex-direction: column;
      gap: var(--gap-large);
      width: 100%;
    }

    .identity {
      display: flex;
      flex-direction: row;
      align-items: flex-start;
    }

    .identity-data {
      display: flex;
      flex-direction: column;
      gap: var(--gap-medium);
      flex: 1;
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
    InventoryListComponent,
    CardComponent,
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
  public avatarEvent = output<AvatarEvent>();
  public descriptionEvent = output<{value: string}>();
  public barsEvent = output<Bar[]>();
  public newStatusEvent = output<AttributeStatus>();
  public editStatusEvent = output<AttributeStatus>();
  public deleteStatusEvent = output<AttributeStatus>();
  public deleteItem = output<InventoryItemEvent>();
  public editItem = output<InventoryItemEvent>();
  public addItem = output<InventoryItemEvent>();
  public addInventory = output<InventoryAdditionEvent>();
  public deleteInventory = output<InventoryDeletionEvent>();

  protected playerBars = computed(() => {
    return this.characterAttributesService.mapPlayerBars(
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
}