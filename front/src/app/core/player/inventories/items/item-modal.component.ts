import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { Item, ItemTag } from '@pagemaster/common/items.types';
import { ButtonComponent } from 'src/app/core/design-system/button.component';
import { ResourcePacksStorage } from 'src/app/core/resource-packs-storage.service';
import { ImageComponent } from '../../../design-system/image.component';
import { InventoryPermissions } from '../inventory.component';
import { ItemsFinderComponent, ItemsFinderState } from './items-finder.component';

@Component({
  selector: 'app-item-modal',
  template: `
  @let item = existingItem();
    @if (!item && permissions().add) {
      <app-items-finder [state]="state()" (newState)="onNewState($event)" (itemClicked)="addItem($event)"/>
    }
    @if (item && permissions().delete) {
      <div class="content">
        <div class="item-detail">
          <ds-image class="item-image" [src]="item.path" [alt]="item.name" size="large" />
          <div class="item-name">{{ item.name }}</div>
          <div class="item-meta">
            <div class="meta-row item-weight"><span class="label">Weight:</span><span class="value">{{ item.weight }}</span></div>
            <div class="meta-row item-rarity"><span class="label">Rarity:</span><span class="value">{{ item.rarity }}</span></div>
            <div class="meta-row item-tags"><span class="label">Tags:</span><span class="value">{{ item.tags.join(', ') }}</span></div>
          </div>
        </div>
      </div>

      <div class="actions">
        <ds-button [mode]="'secondary-danger'" (click)="deleteItem.emit(item)" [icon]="'empty'">Remove Item</ds-button>
      </div>
    }
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--gap-medium);
      padding: var(--gap-medium);

      height: 600px;

      width: 500px;
    }
    .item-detail {
      display: flex;
      flex-direction: column;
      gap: var(--gap-small);
      align-items: center;
      text-align: center;
    }
    .item-image {
      display: block;
      margin: 0 auto;
      border-radius: 8px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    }
    .item-name {
      font-weight: 700;
      font-size: 1.1rem;
      margin-top: 4px;
    }
    .item-meta {
      display: flex;
      flex-direction: column;
      gap: 6px;
      color: var(--color-text);
      width: 100%;
      align-items: center;
    }
    .meta-row {
      display: flex;
      gap: 8px;
      align-items: center;
      justify-content: center;
      width: 100%;
      max-width: 420px;
    }
    .meta-row .label {
      color: var(--color-text-subtle);
      flex: 0 0 auto;
    }
    .meta-row .value {
      font-weight: 700;
      color: var(--color-text);
      flex: 1 1 auto;
      text-align: left;
    }
    .item-tags .value {
      text-align: center;
      word-break: break-word;
    }
    .content {
      flex: 1 1 auto;
      width: 100%;
      display: flex;
      align-items: flex-start;
      justify-content: center;
    }
    .actions {
      display: flex;
      justify-content: center;
      width: 100%;
      margin-top: auto;
    }
    `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, ItemsFinderComponent, ImageComponent],
})
export class ItemModalComponent {
  public existingItem = input<Item | null>(null);
  public permissions = input.required<InventoryPermissions>();
  public editItem = output<Item>();
  public deleteItem = output<Item | null>();

  protected resourcePackService = inject(ResourcePacksStorage);

  protected addItem(item: Item) {
    this.editItem.emit(item);
  }

  protected allItems = computed(() => {
    return this.resourcePackService.resourcePacks().find(pack => pack.theme === 'Post Apocaliptic')!.items.models;
  });
  protected state = signal<ItemsFinderState>({
    data: [],
    count: 0,
    filters: {
      fullText: '',
      tags: [
        ItemTag.AMMO,
        ItemTag.ARMOR,
        ItemTag.MEDICAL,
        ItemTag.WEAPON_MELEE,
        ItemTag.WEAPON_RANGED,
      ],
      rarity: [],
    },
    pagination: {
      pageIndex: 0,
      pageSize: 30,
    },
    lastAction: 'load',
  });


  protected onNewState(newState: ItemsFinderState) {
    const data = this.allItems().filter(item => {
      // Apply filters from newState
      if (newState.filters.rarity.length > 0 && !newState.filters.rarity.includes(item.rarity)) {
        return false;
      }
      if (newState.filters.tags.length > 0 && !newState.filters.tags.some(tag => item.tags.includes(tag))) {
        return false;
      }
      if (newState.filters.fullText) {
        const searchText = newState.filters.fullText.toLowerCase();
        if (!item.name.toLowerCase().includes(searchText) &&
            !item.tags.some(tag => tag.toLowerCase().includes(searchText))) {
          return false;
        }
      }
      return true;
    });

    newState.count = data.length;
    
    // Update pagination
    const start = newState.pagination.pageIndex * newState.pagination.pageSize;
    const end = start + newState.pagination.pageSize;
    newState.data = data.slice(start, end);
    
    this.state.set(newState);
  }
}