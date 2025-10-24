import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, output } from '@angular/core';
import { Item } from '@pagemaster/common/items.types';
import { Character } from '@pagemaster/common/pagemaster.types';
import { CurrentSessionState } from '../../current-session.state';
import { ModalService } from '../../modal';
import { InventoryViewDetailsComponent } from './inventory-view-details.component';
import { InventoryViewComponent } from './inventory-view.component';
import { Inventory } from './inventory.types';
import { AddItemButtonComponent } from './items/add-item-button.component';

@Component({
  selector: 'app-inventory-list-view',
  template: `
    @for(inventory of selectedInventories(); track inventory.instance.id) {
      <section class="inventory-item">
        <div class="inventory-header">
          <app-inventory-view [inventory]="inventory"></app-inventory-view>
          @if(isManager()) {
            <button (click)="deleteInventory.emit(inventory)">🗑️</button>
            <app-add-item-button (itemAdded)="onItemAdded($event, inventory)" />
          }
        </div>
        
        <app-inventory-view-details
          [inventory]="inventory"
          [character]="character()"
          (newInventory)="updatedInventory.emit($event)"
        />
        
      </section>
    }

    @if(isManager()) {
      @for(inventory of availableInventories(); track inventory.instance.id) {
        <section class="inventory-item">
          <div class="inventory-header">
            <app-inventory-view [inventory]="inventory"></app-inventory-view>
            <button (click)="onItemAdded(null, inventory)">Add it to {{ character().name }}</button>
          </div>
        </section>
      }
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
        justify-content: space-between;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    InventoryViewComponent,
    InventoryViewDetailsComponent,
    AddItemButtonComponent,
  ],
})
export class InventoryListViewComponent {
  private currentSessionState = inject(CurrentSessionState);
  public character = input.required<Character>();
  public inventories = input.required<Inventory[]>();
  public updatedInventory = output<Inventory>();
  public deleteInventory = output<Inventory>();
  protected modalService = inject(ModalService);

  protected inventoriesState = linkedSignal(this.inventories);
  private allowedInventories = computed(() => {
    // @todo : this is a security issue, should be handled server side.
    if (this.isManager()) {
      return this.inventoriesState();
    }

    return this.inventoriesState().filter(inv => !inv.def.isSecret);
  });

  protected selectedInventories = computed(() => {
    return this.allowedInventories().filter(inv => inv.selected);
  });

  protected availableInventories = computed(() => {
    return this.allowedInventories().filter(inv => !inv.selected);
  });

  protected isManager = this.currentSessionState.allowedToEditCharacter(this.character);

  protected onItemAdded(newItem: Item | null, inventory: Inventory) {


    const inventories = this.inventoriesState();
    let inventoryToUpdate = inventories.find(inv => inv.instance.id === inventory.instance.id);
    if (newItem && inventoryToUpdate) {
      inventoryToUpdate.instance.current.push(newItem);
    } else {
      inventoryToUpdate = {
        def: inventory.def,
        instance: {
          id: inventory.instance.id,
          current: newItem ? [newItem] : [],
        },
        selected: true,
      };
      inventories.push(inventoryToUpdate);
    }
    this.inventoriesState.set(inventories);
    this.updatedInventory.emit(inventoryToUpdate);
  }

}
