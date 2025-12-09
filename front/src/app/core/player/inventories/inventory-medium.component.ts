import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { AttributeInventory } from '@pagemaster/common/attributes.types';
import {
  EventPlayerInventoryDelete,
  EventPlayerInventoryItemAdd,
  EventPlayerInventoryItemDelete,
  EventPlayerInventoryUpdate,
  EventPlayerTypes,
} from '@pagemaster/common/events-player.types';
import { Item } from '@pagemaster/common/items.types';
import { tap } from 'rxjs';
import { BadgeComponent } from '../../design-system/badge.component';
import { ButtonComponent } from '../../design-system/button.component';
import { ImageComponent } from '../../design-system/image.component';
import { ModalService } from '../../modal';
import { AbstractPlayerControl } from '../abstract-player-control';
import { InventoryFormModalComponent } from './inventory-form-modal.component';
import { ItemModalComponent } from './items/item-modal.component';

@Component({
  selector: 'app-inventory-medium',
  template: `
    <div class="inventory-medium">
      <div class="inventory-header">
        <h3 class="inventory-title">{{ inventory().name }}</h3>
        <div class="header-actions">
          <ds-badge size="small">{{ capacityDisplay() }}</ds-badge>
          @if(permissions().inventory.edit) {
            <ds-button [mode]="'mini'" [icon]="'edit'" (click)="onEditInventory()" />
          }
        </div>
      </div>
      
      <div class="items-list">
        @for(item of sortedItems(); track item.id) {
          <div class="item-row" (click)="openItemGallery(item)">
            <div class="item-icon" [style.border-color]="getRarityColor(item)">
              <ds-image [src]="item.path" [alt]="item.name" size="s" />
            </div>
            <div class="item-info">
              <span class="item-name">{{ item.name }}</span>
              <span class="item-meta">
                <span class="item-rarity">{{ item.rarity }}</span>
                @if(item.weight > 0) {
                  <span class="item-weight">{{ item.weight }}</span>
                }
              </span>
            </div>
          </div>
        }
        @for(placeholder of placeholderCount(); track $index) {
          <div class="item-row item-placeholder" (click)="openAddItemModal()">
            <div class="item-icon placeholder-icon">
              <ds-image [icon]="'plus'" size="s" />
            </div>
            <div class="item-info">
              <span class="item-name placeholder-text">{{ placeholderMode() === 'weight' ? 'Empty' : 'Add Item' }}</span>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .inventory-medium {
      display: flex;
      flex-direction: column;
      gap: var(--gap-medium);
      width: 100%;
      padding: var(--padding-medium);
      background: var(--color-background-secondary);
      border-radius: var(--view-border-radius);
      border: var(--view-border);
    }

    .inventory-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--gap-medium);
    }

    .inventory-title {
      margin: 0;
      color: var(--text-primary);
      font-size: var(--text-size-medium);
      font-weight: var(--text-weight-bold);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: var(--gap-small);
    }

    .items-list {
      display: flex;
      flex-direction: column;
      gap: var(--gap-small);
    }

    .item-row {
      display: flex;
      align-items: center;
      gap: var(--gap-medium);
      padding: var(--padding-small);
      background: var(--color-background-tertiary);
      border-radius: var(--view-border-radius);
      cursor: pointer;
      transition: opacity var(--transition-speed) ease, background-color var(--transition-speed) ease;
    }

    .item-row:hover {
      opacity: 0.8;
      background: var(--color-background-primary);
    }

    .item-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border: 2px solid var(--color-border);
      border-radius: var(--item-component-border-radius);
      background: var(--color-background-secondary);
      flex-shrink: 0;
    }

    .item-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
      min-width: 0;
    }

    .item-name {
      color: var(--text-primary);
      font-size: var(--text-size-medium);
      font-weight: var(--text-weight-medium);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .item-meta {
      display: flex;
      align-items: center;
      gap: var(--gap-small);
      font-size: var(--text-size-small);
      color: var(--text-secondary);
    }

    .item-rarity {
      text-transform: capitalize;
    }

    .item-weight::before {
      content: '⚖ ';
    }

    .item-placeholder {
      border: 1px dashed var(--color-border);
      background: transparent;
    }

    .item-placeholder .item-icon {
      border-style: dashed;
      opacity: 0.6;
    }

    .item-placeholder .placeholder-text {
      color: var(--text-secondary);
      font-style: italic;
    }

    .item-placeholder:hover {
      background: var(--color-background-tertiary);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ImageComponent, BadgeComponent, ButtonComponent],
})
export class InventoryMediumComponent extends AbstractPlayerControl {
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
    
    const placeholderCount = Math.max(0, Math.min(3, Math.floor(remainingWeight)));
    
    return Array(placeholderCount).fill(0) as number[];
  });

  protected getRarityColor(item: Item): string {
    switch (item.rarity) {
      case 'COMMON':
        return 'var(--item-component-color-uncommon)';
      case 'RARE':
        return 'var(--item-component-color-rare)';
      case 'EPIC':
        return 'var(--item-component-color-epic)';
      case 'LEGENDARY':
        return 'var(--item-component-color-legendary)';
      default:
        return 'var(--color-border)';
    }
  }

  protected openItemGallery(item: Item) {
    const ref = this.modalService.open(ItemModalComponent, {
      existingItem: item,
      permissions: this.permissions().inventory.item,
    });

    ref.componentRef.instance.deleteItem.subscribe(() => {
      this.deleteItemToInventory(item).pipe(
        tap(() => void ref.close()),
      ).subscribe();
    });
  }

  protected openAddItemModal() {
    if (!this.permissions().inventory.item.add) {
      return;
    }

    const ref = this.modalService.open(ItemModalComponent, {
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
