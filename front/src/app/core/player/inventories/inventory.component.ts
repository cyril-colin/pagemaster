import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { AttributeInventory } from '@pagemaster/common/attributes.types';
import {
  EventPlayerInventoryDelete,
  EventPlayerInventoryItemAdd,
  EventPlayerInventoryItemDelete,
  EventPlayerInventoryItemGive,
  EventPlayerInventoryUpdate,
  EventPlayerTypes,
} from '@pagemaster/common/events-player.types';
import { Item } from '@pagemaster/common/items.types';
import { tap } from 'rxjs';
import { ButtonComponent } from '../../design-system/button.component';
import { ModalService } from '../../modal';
import { AbstractPlayerControl } from '../abstract-player-control';
import { InventoryFormModalComponent } from './inventory-form-modal.component';
import { ItemModalComponent } from './items/item-modal.component';
import { ItemPlaceholderComponent } from './items/item-placeholder.component';
import { ItemComponent } from './items/item.component';

@Component({
  selector: 'app-inventory',
  template: `
      <div class="inventory-header">
        <h3 class="inventory-title">{{ inventory().name }} - {{ capacityDisplay() }}</h3>
        @if(permissions().inventory.edit) {
          <div class="header-actions">
            <ds-button [mode]="'mini'" [icon]="'edit'" (click)="onEditInventory()" />
          </div>
        }
      </div>
      <div class="items">
        @for(item of sortedItems(); track item.id) {
          <app-item [item]="item" (click)="openItemGallery(item)" />
        }
        @for(placeholder of placeholderCount(); track $index) {
          <app-item-placeholder
            [mode]="placeholderMode()"
            [canAdd]="permissions().inventory.item.add"
            (click)="openAddItemModal()"
          />
        }
      </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--gap-medium);
      width: 100%;
      padding-top: var(--gap-small);
      border-top: 1px solid var(--color-border);
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
      align-items: baseline;
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
  imports: [ItemComponent, ItemPlaceholderComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryComponent extends AbstractPlayerControl {
  public inventory = input.required<AttributeInventory>();


  protected modalService = inject(ModalService);
  protected sortedItems = computed(() => {
    return this.inventory().current.sort((a, b) => b.weight - a.weight);
  });

  protected placeholderMode = computed(() => {
    const capacity = this.inventory().capacity;
    return capacity.type;
  });

  protected capacityDisplay = computed(() => {
    const inventory = this.inventory();
    const capacity = inventory.capacity;

    if (capacity.type === 'weight') {
      const maxWeight = capacity.max;
      return `${inventory.current.length} / ${maxWeight}`;
    }

    if (capacity.type === 'state') {
      return capacity.value;
    }

    return '';
  });

  protected placeholderCount = computed(() => {
    const inventory = this.inventory();
    
    // Only show placeholders if the inventory has a weight-based capacity
    if (inventory.capacity.type !== 'weight') {
      // For state-based capacity, show 1 placeholder if not full
      if (inventory.capacity.type === 'state') {
        const state = inventory.capacity.value;
        return state === 'full' ? [] as number[] : [1] as number[];
      }
      return [] as number[];
    }

    const currentWeight = inventory.current.reduce((sum, item) => sum + item.weight, 0);
    const maxWeight = inventory.capacity.max;
    const remainingWeight = maxWeight - currentWeight;
    
    // Calculate how many empty slots to show (one per remaining weight unit)
    // You can adjust this logic based on your needs
    const placeholderCount = Math.max(0, Math.floor(remainingWeight));
    
    return Array(placeholderCount).fill(0) as number[];
  });

  protected openItemGallery(item: Item) {
    const ref = this.modalService.open(ItemModalComponent, {
      existingItem: item,
      currentOwnerId: this.player().id,
      permissions: this.permissions().inventory.item,
    });

    ref.componentRef.instance.deleteItem.subscribe(() => {
      this.deleteItemToInventory(item).pipe(
        tap(() => void ref.close()),
      ).subscribe();
    });

    ref.componentRef.instance.giveItem.subscribe(({ item: givenItem, recipientPlayerId }) => {
      this.giveItemToPlayer(givenItem, recipientPlayerId).pipe(
        tap(() => void ref.close()),
      ).subscribe();
    });
  }

  protected openAddItemModal() {
    const ref = this.modalService.open(ItemModalComponent, {
      currentOwnerId: this.player().id,
      permissions: this.permissions().inventory.item,
    });
    ref.componentRef.instance.addItems.subscribe((newItems: Item[]) => {
      this.addItemToInventory(newItems).pipe(
        tap(() => void ref.close()),
      ).subscribe(
      );
    });

    ref.componentRef.instance.cancel.subscribe(() => {
      void ref.close();
    });
  }

  protected onEditInventory() {
    this.modalService.open(InventoryFormModalComponent, {
      inventory: this.inventory(),
      gameSession: this.gameSession(),
      player: this.player(),
      permissions: this.permissions(),
    });
  }
  

  protected addItemToInventory(items: Item[]) {
    const command = this.prepareEvent(EventPlayerTypes.PLAYER_INVENTORY_ITEM_ADD) as Omit<EventPlayerInventoryItemAdd, 'id' | 'timestamp'>;
    command.newItems = items;
    command.inventoryId = this.inventory().id;
    return this.gameEventRepository.postCommand(command);
  }


  protected deleteItemToInventory(item: Item) {
    const command =
      this.prepareEvent(EventPlayerTypes.PLAYER_INVENTORY_ITEM_DELETE) as Omit<EventPlayerInventoryItemDelete, 'id' | 'timestamp'>;
    command.deletedItem = item;
    command.inventoryId = this.inventory().id;
    return this.gameEventRepository.postCommand(command);
  }

  protected giveItemToPlayer(item: Item, recipientPlayerId: string) {
    // Find the first inventory of the recipient player
    const recipientPlayer = this.gameSession().players.find(p => p.id === recipientPlayerId);
    if (!recipientPlayer || recipientPlayer.attributes.inventory.length === 0) {
      throw new Error('Recipient player not found or has no inventory');
    }
    
    const command = this.prepareEvent(EventPlayerTypes.PLAYER_INVENTORY_ITEM_GIVE) as Omit<EventPlayerInventoryItemGive, 'id' | 'timestamp'>;
    command.fromInventoryId = this.inventory().id;
    command.toPlayerId = recipientPlayerId;
    command.toInventoryId = recipientPlayer.attributes.inventory[0].id;
    command.givenItem = item;
    
    return this.gameEventRepository.postCommand(command);
  }


  protected deleteInventory() {
    const command = this.prepareEvent(EventPlayerTypes.PLAYER_INVENTORY_DELETE) as Omit<EventPlayerInventoryDelete, 'id' | 'timestamp'>;
    command.inventoryId = this.inventory().id;

    return this.gameEventRepository.postCommand(command);
  }

  protected updateInventory(updatedInventory: AttributeInventory) {
    const command = this.prepareEvent(EventPlayerTypes.PLAYER_INVENTORY_UPDATE) as Omit<EventPlayerInventoryUpdate, 'id' | 'timestamp'>;
    command.newInventory = updatedInventory;

    return this.gameEventRepository.postCommand(command);
  }
}


