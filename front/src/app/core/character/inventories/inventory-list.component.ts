import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { AttributeInventory } from '@pagemaster/common/attributes.types';
import { Character } from '@pagemaster/common/pagemaster.types';
import { CurrentSessionState } from '../../current-session.state';
import { ModalRef, ModalService } from '../../modal';
import { InventoryFormComponent } from './inventory-form.component';
import { InventoryAdderButtonComponent } from './inventory-selector.component';
import {
  InventoryComponent,
  InventoryDeletionEvent,
  InventoryItemEvent,
  InventoryPermissions,
  InventoryUpdateEvent,
} from './inventory.component';

export type InventoryAdditionEvent = {
  inventory: AttributeInventory,
  modalRef: ModalRef<InventoryFormComponent>,
};

export type InventoryListPermissions = {
  item: InventoryPermissions,
  addition: boolean,
};

@Component({
  selector: 'app-inventory-list',
  template: `
    @if(permissions().addition) {
      <app-inventory-adder-button (addInventory)="addInventory.emit($event)" />
    }
    @for(inventory of allowedInventories(); track inventory.id) {
        <app-inventory
          [inventory]="inventory"
          [character]="character()"
          [permissions]="permissions().item"
          (addItem)="addItem.emit({ item: $event.item, inventory, modalRef: $event.modalRef })"
          (deleteItem)="deleteItem.emit({ item: $event.item, inventory, modalRef: $event.modalRef })"
          (editItem)="editItem.emit({ item: $event.item, inventory, modalRef: $event.modalRef })"
          (updateInventory)="updateInventory.emit($event)"
          (deleteInventory)="deleteInventory.emit({ inventory })"
        />
    }
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    InventoryComponent,
    InventoryAdderButtonComponent,
  ],
})
export class InventoryListComponent {
  
  public character = input.required<Character>();
  public inventories = input.required<AttributeInventory[]>();
  public permissions = input.required<InventoryListPermissions>();
  public deleteItem = output<InventoryItemEvent>();
  public editItem = output<InventoryItemEvent>();
  public addItem = output<InventoryItemEvent>();
  public addInventory = output<InventoryAdditionEvent>();
  public updateInventory = output<InventoryUpdateEvent>();
  public deleteInventory = output<InventoryDeletionEvent>();

  private currentSessionState = inject(CurrentSessionState);
  protected modalService = inject(ModalService);

  protected allowedInventories = computed(() => {
    // @todo : this is a security issue, should be handled server side.
    if (this.isManager()) {
      return this.inventories();
    }

    return this.inventories().filter(inv => !inv.isSecret);
  });

  protected isManager = this.currentSessionState.allowedToEditCharacter();

}
