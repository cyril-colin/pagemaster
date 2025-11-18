import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AttributeBar, AttributeStatus } from '@pagemaster/common/attributes.types';
import { Player } from '@pagemaster/common/pagemaster.types';
import { CardComponent } from '../design-system/card.component';
import { AvatarEvent, AvatarPermissions, PictureControlComponent } from './avatar/picture-control.component';
import { BarsControlComponent, BarsPermissions } from './bars/bars-control.component';
import { DescriptionControlComponent, DescriptionPermissions } from './descriptions/description-control.component';
import {
  InventoryAdditionEvent,
  InventoryListComponent,
  InventoryListPermissions,
} from './inventories/inventory-list.component';
import { InventoryDeletionEvent, InventoryItemEvent, InventoryUpdateEvent } from './inventories/inventory.component';
import { NameControlComponent, NamePermissions } from './names/name-control.component';
import { StatusControlComponent, StatusesPermissions } from './statuses/status-control.component';


export type PlayerPermissions = {
  inventory: InventoryListPermissions,
  avatar: AvatarPermissions,
  name: NamePermissions,
  description: DescriptionPermissions,
  bars: BarsPermissions,
  statuses: StatusesPermissions,
}


@Component({
  selector: 'app-player-form',
  template: `
    <form>
      <ds-card>
        <div class="identity">
          <app-picture-control
            [picture]="existingPlayer().avatar"
            [permissions]="permissions().avatar"
            (newPicture)="avatarEvent.emit($event)"
          />
          <div class="identity-data">
            <app-name-control
              [name]="existingPlayer().name"
              [permissions]="permissions().name"
              (newName)="renameEvent.emit($event)"
            />
            <app-status-control
              [statuses]="existingPlayer().attributes.status"
              [permissions]="permissions().statuses"
              (newStatus)="newStatusEvent.emit($event)"
              (editStatus)="editStatusEvent.emit($event)"
              (deleteStatus)="deleteStatusEvent.emit($event)"
            />
            
          </div>
        </div>
        <app-description-control
          [description]="existingPlayer().description"
          [permissions]="permissions().description"
          (newDescription)="descriptionEvent.emit($event)"
        />

        <app-bars-control
          [bars]="existingPlayer().attributes.bar"
          [permissions]="permissions().bars"
          (newBarValue)="newBarValueEvent.emit($event)"
          (newBar)="newBarEvent.emit($event)"
          (editBar)="editBarEvent.emit($event)"
          (deleteBar)="deleteBarEvent.emit($event)"
        />
      </ds-card>

      
      <app-inventory-list
        [inventories]="existingPlayer().attributes.inventory"
        [permissions]="permissions().inventory"
        (addItem)="addItem.emit($event)"
        (deleteItem)="deleteItem.emit($event)"
        (editItem)="editItem.emit($event)"
        (addInventory)="addInventory.emit($event)"
        (updateInventory)="updateInventory.emit($event)"
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
      padding: 0 var(--gap-large);
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
export class PlayerFormComponent  {
  public existingPlayer = input.required<Player>();
  public permissions = input.required<PlayerPermissions>();
  public newPlayer = output<Player>();
  public fb = inject(FormBuilder);
  public renameEvent = output<{value: string}>();
  public avatarEvent = output<AvatarEvent>();
  public descriptionEvent = output<{value: string}>();
  public newBarValueEvent = output<AttributeBar>();
  public newBarEvent = output<AttributeBar>();
  public editBarEvent = output<AttributeBar>();
  public deleteBarEvent = output<AttributeBar>();
  public newStatusEvent = output<AttributeStatus>();
  public editStatusEvent = output<AttributeStatus>();
  public deleteStatusEvent = output<AttributeStatus>();
  public deleteItem = output<InventoryItemEvent>();
  public editItem = output<InventoryItemEvent>();
  public addItem = output<InventoryItemEvent>();
  public addInventory = output<InventoryAdditionEvent>();
  public updateInventory = output<InventoryUpdateEvent>();
  public deleteInventory = output<InventoryDeletionEvent>();
}