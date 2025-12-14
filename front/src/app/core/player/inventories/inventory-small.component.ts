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
import { BadgeComponent } from '../../design-system/badge.component';
import { ButtonComponent } from '../../design-system/button.component';
import { ModalService } from '../../modal';
import { AbstractPlayerControl } from '../abstract-player-control';
import { InventoryFormModalComponent } from './inventory-form-modal.component';
import { ItemModalComponent } from './items/item-modal.component';
import { ItemPlaceholderComponent } from './items/item-placeholder.component';
import { ItemComponent } from './items/item.component';

@Component({
  selector: 'app-inventory-small',
  template: `
    <div class="inventory-small">
      <div class="inventory-header">
        <h4 class="inventory-title">{{ inventory().name }}</h4>
        <div class="header-actions">
          <ds-badge size="small">{{ capacityDisplay() }}</ds-badge>
          @if(permissions().inventory.edit) {
            <ds-button [mode]="'mini'" [icon]="'edit'" (click)="onEditInventory()" />
          }
        </div>
      </div>
      
      <div class="items-row">
        @for(item of sortedItems(); track item.id) {
          <app-item [item]="item" [size]="'xs'" (click)="openItemGallery(item)" />
        }
        @for(placeholder of placeholderCount(); track $index) {
          <app-item-placeholder
            [mode]="placeholderMode()"
            [canAdd]="permissions().inventory.item.add"
            (click)="openAddItemModal()"
          />
        }
      </div>
    </div>
  `,
  styles: [`
    .inventory-small {
      display: flex;
      flex-direction: column;
      gap: var(--gap-small);
      width: 100%;
      padding: var(--padding-small);
      background: var(--color-background-secondary);
      border-radius: var(--view-border-radius);
      border: var(--view-border);
    }

    .inventory-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--gap-small);
    }

    .inventory-title {
      margin: 0;
      color: var(--text-primary);
      font-size: var(--text-size-small);
      font-weight: var(--text-weight-bold);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: var(--gap-small);
    }

    .items-row {
      display: flex;
      align-items: center;
      gap: var(--gap-small);
      flex-wrap: wrap;
    }

    app-item {
      cursor: pointer;
      transition: opacity var(--transition-speed) ease, transform var(--transition-speed) ease;
    }

    app-item:hover {
      opacity: 0.8;
      transform: scale(1.05);
    }

    app-item-placeholder {
      cursor: pointer;
      width: var(--item-component-xs);
      height: var(--item-component-xs);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ItemComponent, BadgeComponent, ButtonComponent, ItemPlaceholderComponent],
})
export class InventorySmallComponent extends AbstractPlayerControl {
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
    
    if (inventory.capacity.type !== 'weight') {
      if (inventory.capacity.type === 'state') {
        const state = inventory.capacity.value;
        return state === 'full' ? [] as number[] : [1] as number[];
      }
      return [] as number[];
    }

    const currentWeight = inventory.current.reduce((sum, item) => sum + item.weight, 0);
    const maxWeight = inventory.capacity.max;
    const remainingWeight = maxWeight - currentWeight;
    
    const placeholderCount = Math.max(0, Math.min(5, Math.floor(remainingWeight)));
    
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
    if (!this.permissions().inventory.item.add) {
      return;
    }

    const ref = this.modalService.open(ItemModalComponent, {
      currentOwnerId: this.player().id,
      permissions: this.permissions().inventory.item,
    });
    
    ref.componentRef.instance.addItems.subscribe((newItems: Item[]) => {
      this.addItemToInventory(newItems).pipe(
        tap(() => void ref.close()),
      ).subscribe();
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
    const recipientPlayer = this.gameSession().players.find(p => p.id === recipientPlayerId);
    if (!recipientPlayer || recipientPlayer.attributes.inventory.length === 0) {
      throw new Error('Recipient player not found or has no inventory');
    }
    
    const command = this.prepareEvent(
      EventPlayerTypes.PLAYER_INVENTORY_ITEM_GIVE) as Omit<EventPlayerInventoryItemGive, 'id' | 'timestamp'>;
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
