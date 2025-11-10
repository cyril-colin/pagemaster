import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { Character } from '@pagemaster/common/pagemaster.types';
import { CurrentSessionState } from '../../current-session.state';
import { ModalRef, ModalService } from '../../modal';
import { InventoryAdderButtonComponent, InventoryAdderComponent } from './inventory-selector.component';
import {
  InventoryComponent,
  InventoryDeletionEvent,
  InventoryItemEvent,
  InventoryPermissions,
} from './inventory.component';
import { Inventory } from './inventory.types';

export type InventoryAdditionEvent = {
  inventory: Inventory,
  modalRef: ModalRef<InventoryAdderComponent>,
};

export type InventoryListPermissions = {
  item: InventoryPermissions,
  addition: boolean,
};

@Component({
  selector: 'app-inventory-list',
  template: `
    @if(permissions().addition) {
      <app-inventory-adder-button [inventories]="inventories()" (addInventory)="addInventory.emit($event)" />
    }
    @for(inventory of displayedInventories(); track inventory.instance.id) {
        <app-inventory
          [inventory]="inventory"
          [character]="character()"
          [permissions]="permissions().item"
          (addItem)="addItem.emit({ item: $event.item, inventory, modalRef: $event.modalRef })"
          (deleteItem)="deleteItem.emit({ item: $event.item, inventory, modalRef: $event.modalRef })"
          (editItem)="editItem.emit({ item: $event.item, inventory, modalRef: $event.modalRef })"
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
  public inventories = input.required<Inventory[]>();
  public permissions = input.required<InventoryListPermissions>();
  public deleteItem = output<InventoryItemEvent>();
  public editItem = output<InventoryItemEvent>();
  public addItem = output<InventoryItemEvent>();
  public addInventory = output<InventoryAdditionEvent>();
  public deleteInventory = output<InventoryDeletionEvent>();

  private currentSessionState = inject(CurrentSessionState);
  protected modalService = inject(ModalService);

  private allowedInventories = computed(() => {
    // @todo : this is a security issue, should be handled server side.
    if (this.isManager()) {
      return this.inventories();
    }

    return this.inventories().filter(inv => !inv.def.isSecret);
  });

  protected displayedInventories = computed(() => {
    // Only show inventories that have been added (have an instance.id)
    return this.allowedInventories().filter(inv => inv.instance.id);
  });

  protected isManager = this.currentSessionState.allowedToEditCharacter();

}
