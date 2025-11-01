import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { Item } from '@pagemaster/common/items.types';
import { Character } from '@pagemaster/common/pagemaster.types';
import { CurrentSessionState } from '../../current-session.state';
import { ModalRef, ModalService } from '../../modal';
import { InventorySelectorButtonComponent, InventorySelectorComponent } from './inventory-selector.component';
import { InventoryComponent } from './inventory.component';
import { Inventory } from './inventory.types';
import { ItemListComponent, ItemListPermissions } from './item-list.component';
import { ItemModalComponent } from './items/item-modal.component';

export type InventoryItemEvent = {
  item: Item,
  inventory: Inventory,
  modalRef: ModalRef<ItemModalComponent>,
};

export type InventorySelectionEvent = {
  type: 'select' | 'unselect',
  inventory: Inventory,
  modalRef: ModalRef<InventorySelectorComponent>,
};

export type InventoryPermissions = {
  item: ItemListPermissions,
  selection: boolean,
};

@Component({
  selector: 'app-inventory-list',
  template: `
    @for(inventory of selectedInventories(); track inventory.instance.id) {
      <section class="inventory-item">
        <div class="inventory-header">
          <app-inventory [inventory]="inventory"></app-inventory>
          
        </div>
        
        <app-item-list
          [inventory]="inventory"
          [character]="character()"
          [permissions]="permissions().item"
          (addItem)="addItem.emit({ item: $event.item, inventory, modalRef: $event.modalRef })"
          (deleteItem)="deleteItem.emit({ item: $event.item, inventory, modalRef: $event.modalRef })"
          (editItem)="editItem.emit({ item: $event.item, inventory, modalRef: $event.modalRef })"
        />
        
      </section>
    }

    @if(permissions().selection) {
      <app-inventory-selector-button [inventories]="inventories()" (select)="select.emit($event)" (unselect)="unselect.emit($event)" />
    }
    
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: flex-start;
      gap: var(--gap-medium);
      width: 100%;
      

      button {
        border: none;
      }

      .inventory-header {
        display: flex;
        align-items: center;
        gap: var(--gap-small);
        width: 100%;
        height: 120px;
        justify-content: space-between;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    InventoryComponent,
    ItemListComponent,
    InventorySelectorButtonComponent,
  ],
})
export class InventoryListComponent {
  
  public character = input.required<Character>();
  public inventories = input.required<Inventory[]>();
  public permissions = input.required<InventoryPermissions>();
  public deleteItem = output<InventoryItemEvent>();
  public editItem = output<InventoryItemEvent>();
  public addItem = output<InventoryItemEvent>();
  public select = output<InventorySelectionEvent>();
  public unselect = output<InventorySelectionEvent>();

  private currentSessionState = inject(CurrentSessionState);
  protected modalService = inject(ModalService);

  private allowedInventories = computed(() => {
    // @todo : this is a security issue, should be handled server side.
    if (this.isManager()) {
      return this.inventories();
    }

    return this.inventories().filter(inv => !inv.def.isSecret);
  });

  protected selectedInventories = computed(() => {
    return this.allowedInventories().filter(inv => inv.selected);
  });

  protected isManager = this.currentSessionState.allowedToEditCharacter(this.character);

}
