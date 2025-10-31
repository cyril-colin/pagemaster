import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { Item } from '@pagemaster/common/items.types';
import { Character } from '@pagemaster/common/pagemaster.types';
import { CurrentSessionState } from '../../current-session.state';
import { ModalRef, ModalService } from '../../modal';
import { InventoryComponent } from './inventory.component';
import { Inventory } from './inventory.types';
import { ItemListComponent } from './item-list.component';
import { AddItemComponent } from './items/add-item.component';
import { ItemModalComponent } from './items/item-modal.component';

export type InventoryItemEvent = {
  item: Item,
  inventory: Inventory,
  modalRef: ModalRef<ItemModalComponent>,
};


@Component({
  selector: 'app-inventory-list',
  template: `
    @for(inventory of selectedInventories(); track inventory.instance.id) {
      <section class="inventory-item">
        <div class="inventory-header">
          <app-inventory [inventory]="inventory"></app-inventory>
          @if(isManager()) {
            <app-add-item (itemAdded)="addItem.emit({ item: $event.item, inventory, modalRef: $event.modalRef })" />
          }
        </div>
        
        <app-item-list
          [inventory]="inventory"
          [character]="character()"
          (deleteItem)="deleteItem.emit({ item: $event.item, inventory, modalRef: $event.modalRef })"
          (editItem)="editItem.emit({ item: $event.item, inventory, modalRef: $event.modalRef })"
        />
        
      </section>
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
    AddItemComponent,
  ],
})
export class InventoryListComponent {
  private currentSessionState = inject(CurrentSessionState);
  public character = input.required<Character>();
  public inventories = input.required<Inventory[]>();
  public deleteItem = output<InventoryItemEvent>();
  public editItem = output<InventoryItemEvent>();
  public addItem = output<InventoryItemEvent>();

  public deleteInventory = output<Inventory>();
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
