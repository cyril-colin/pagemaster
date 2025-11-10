import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { Item } from '@pagemaster/common/items.types';
import { Character } from '@pagemaster/common/pagemaster.types';
import { BadgeComponent } from '../../design-system/badge.component';
import { ButtonComponent } from '../../design-system/button.component';
import { CardComponent } from '../../design-system/card.component';
import { ModalRef, ModalService } from '../../modal';
import { Inventory } from './inventory.types';
import { ItemModalComponent } from './items/item-modal.component';
import { ItemPlaceholderComponent } from './items/item-placeholder.component';
import { ItemComponent } from './items/item.component';

export type InventoryPermissions = {
  add: boolean,
  edit: boolean,
  delete: boolean,
}

export type InventoryItemEvent = {
  item: Item,
  inventory: Inventory,
  modalRef: ModalRef<ItemModalComponent>,
};

export type InventoryDeletionEvent = {
  inventory: Inventory,
};


@Component({
  selector: 'app-inventory',
  template: `
    <ds-card>
      <div class="inventory-header">
        <h3 class="inventory-title">{{ inventory().def.name }}</h3>
        <div class="header-actions">
          <ds-badge size="medium">{{ capacityDisplay() }}</ds-badge>
          @if(permissions().delete) {
            <ds-button 
              mode="secondary-danger" 
              icon="trash"
              (click)="onDeleteInventory()"
            />
          }
        </div>
      </div>
      <div class="items">
        @for(item of sortedItems(); track item.id) {
          <app-item [item]="item" (itemClicked)="openItemGallery($event)" />
        }
        @for(placeholder of placeholderCount(); track $index) {
          <app-item-placeholder 
            [mode]="placeholderMode()"
            [canAdd]="permissions().add"
            (placeholderClicked)="openAddItemModal()" 
          />
        }
      </div>
    </ds-card>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--gap-medium);
      width: 100%;
      padding-top: var(--gap-small);
    }

    ds-card {
      width: 100%;
      display: flex;
    }

    .items {
      display: flex;
      width: 100%;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      gap: var(--gap-small);
    }

    .inventory-title {
      margin: 0;
      margin-bottom: var(--gap-medium);
      color: var(--text-primary);
      font-size: var(--text-size-large);
      font-weight: var(--text-weight-bold);
    }

    .inventory-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--gap-medium);
      margin-bottom: var(--gap-medium);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: var(--gap-small);
    }


  `],
  imports: [ItemComponent, CardComponent, ItemPlaceholderComponent, BadgeComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryComponent {
  public character = input.required<Character>();
  public inventory = input.required<Inventory>();
  public permissions = input.required<InventoryPermissions>();
  public addItem = output<Omit<InventoryItemEvent, 'inventory'>>();
  public deleteItem = output<Omit<InventoryItemEvent, 'inventory'>>();
  public editItem = output<Omit<InventoryItemEvent, 'inventory'>>();
  public deleteInventory = output<InventoryDeletionEvent>();


  protected modalService = inject(ModalService);
  protected sortedItems = computed(() => {
    return this.inventory().instance.current.sort((a, b) => b.weight - a.weight);
  });

  protected placeholderMode = computed(() => {
    const capacity = this.inventory().def.capacity;
    return capacity.type;
  });

  protected capacityDisplay = computed(() => {
    const inventory = this.inventory();
    const capacity = inventory.def.capacity;

    if (capacity.type === 'weight') {
      const maxWeight = capacity.max;
      return `${inventory.instance.current.length} / ${maxWeight}`;
    }

    if (capacity.type === 'state') {
      return capacity.value;
    }

    return '';
  });

  protected placeholderCount = computed(() => {
    const inventory = this.inventory();
    
    // Only show placeholders if the inventory has a weight-based capacity
    if (inventory.def.capacity.type !== 'weight') {
      // For state-based capacity, show 1 placeholder if not full
      if (inventory.def.capacity.type === 'state') {
        const state = inventory.def.capacity.value;
        return state === 'full' ? [] as number[] : [1] as number[];
      }
      return [] as number[];
    }

    const currentWeight = inventory.instance.current.reduce((sum, item) => sum + item.weight, 0);
    const maxWeight = inventory.def.capacity.max;
    const remainingWeight = maxWeight - currentWeight;
    
    // Calculate how many empty slots to show (one per remaining weight unit)
    // You can adjust this logic based on your needs
    const placeholderCount = Math.max(0, Math.floor(remainingWeight));
    
    return Array(placeholderCount).fill(0) as number[];
  });

  protected openItemGallery(item: Item) {
    const ref = this.modalService.open(ItemModalComponent, {
      existingItem: item,
      permissions: this.permissions(),
    });
    ref.componentRef.instance.editItem.subscribe((newItem: Item) => {
      this.editItem.emit({ item: newItem, modalRef: ref });
    });

    ref.componentRef.instance.deleteItem.subscribe(() => {
      this.deleteItem.emit({ item, modalRef: ref });
    });
  }

  protected openAddItemModal() {
    const ref = this.modalService.open(ItemModalComponent, {
      permissions: this.permissions(),
    });
    ref.componentRef.instance.editItem.subscribe((newItem: Item) => {
      this.addItem.emit({ item: newItem, modalRef: ref });
    });
  }

  protected async onDeleteInventory() {
    const inventoryName = this.inventory().def.name;
    const result = await this.modalService.confirmation(
      `Are you sure you want to delete the inventory "${inventoryName}"? This action cannot be undone.`,
      `Confirm deletion of "${inventoryName}"`,
    );
    
    if (result === 'confirmed') {
      this.deleteInventory.emit({inventory: this.inventory()});
    }
  }
}


