import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { Item, ItemRarityFilters, ItemTag } from '@pagemaster/common/items.types';
import { GameSessionPermissions } from '@pagemaster/common/permissions.types';
import { ButtonComponent } from 'src/app/core/design-system/button.component';
import {
  ModalLayoutComponent,
  ModalLayoutFooterComponent,
  ModalLayoutHeaderComponent,
  ModalLayoutSectionComponent,
} from 'src/app/core/modal/modal-layout';
import { ResourcePacksStorage } from 'src/app/core/resource-packs-storage.service';
import { ImageComponent } from '../../../design-system/image.component';
import { ItemsFinderComponent, ItemsFinderState } from './items-finder.component';

@Component({
  selector: 'app-item-modal',
  template: `
  @let item = existingItem();
  <ds-modal-layout>
    <ds-modal-layout-header [title]="item?.name || 'Add Items'">
      @if(permissions().delete && item) {
        <ds-button [mode]="'secondary-danger'" (click)="deleteItem.emit(item)" [icon]="'empty'"></ds-button>
      }
    </ds-modal-layout-header>
    
    <ds-modal-layout-section>
      @if(item) {
        <ds-image class="item-image" [src]="item.path" [alt]="item.name" [size]="'l'" />
        <section>
          <article><span>Weight:</span><span class="value">{{ item.weight }}</span></article>
          <article><span>Rarity:</span><span class="value">{{ item.rarity }}</span></article>
          <article><span>Tags:</span><span class="value">{{ item.tags.join(', ') }}</span></article>
        </section>
      } @else {
        <app-items-finder [state]="state()" (newState)="onNewState($event)"/>
      }
    </ds-modal-layout-section>
    

    @if(!item) {
      <ds-modal-layout-footer>
        <ds-button
            [mode]="'primary'"
            [disabled]="state().selection.length === 0"
            (click)="selectItems(state().selection)"
            [icon]="'plus'"
          >
            Add ({{state().selection.length}} selected)
          </ds-button>
      </ds-modal-layout-footer>
    }
  </ds-modal-layout>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;

      ds-modal-layout-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--gap-large);
        overflow-y: auto;

        section {
          display: flex;
          flex-direction: column;
          gap: var(--gap-medium);
        }
        .value {
          font-weight: var(--text-weight-bold);
        }
      }
    }
    `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonComponent,
    ImageComponent,
    ModalLayoutComponent,
    ModalLayoutHeaderComponent,
    ModalLayoutSectionComponent,
    ItemsFinderComponent,
    ModalLayoutFooterComponent,
  ],
})
export class ItemModalComponent {
  public existingItem = input<Item | null>(null);
  public permissions = input.required<GameSessionPermissions['inventory']['item']>();
  public addItems = output<Item[]>();
  public selectItems(items: Item[]) {
    this.addItems.emit(items);
  }
  public deleteItem = output<Item | null>();
  public cancel = output<void>();
  protected resourcePackService = inject(ResourcePacksStorage);

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
      pageSize: 12,
    },
    selection: [],
    lastAction: 'load',
  });


  protected onNewState(newState: ItemsFinderState) {
    if (newState.lastAction === 'selection') {
      this.state.set(newState);
    }
    const data = this.allItems().filter(item => {
      if (item.rarity === 'NEVER') {
        return false;
      }
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
    }).sort((a, b) => {
      const rarityA = ItemRarityFilters[a.rarity]?.sortValue ?? 0;
      const rarityB = ItemRarityFilters[b.rarity]?.sortValue ?? 0;
      return rarityB - rarityA;
    });

    newState.count = data.length;

    // Update pagination and produce the page slice
    const start = newState.pagination.pageIndex * newState.pagination.pageSize;
    const end = start + newState.pagination.pageSize;
    newState.data = data.slice(0, end);


    this.state.set(newState);
  }
}