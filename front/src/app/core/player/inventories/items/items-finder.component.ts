import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, input, linkedSignal, output, signal } from '@angular/core';
import { Item, ItemRarity, ItemRarityFilters, ItemTag, ItemTagFilters } from '@pagemaster/common/items.types';
import { ButtonComponent } from 'src/app/core/design-system/button.component';
import { ImageComponent } from 'src/app/core/design-system/image.component';
import { DSOption, MultiSelectDropdownComponent } from 'src/app/core/design-system/multi-select-dropdown.component';
import { ItemComponent } from './item.component';


export type ItemsFinderState = {
  data: Item[],
  count: number,
  filters: {
    fullText: string,
    tags: ItemTag[],
    rarity: ItemRarity[],
  },
  pagination: {
    pageIndex: number,
    pageSize: number,
  },
  lastAction: 'filter' | 'paginate' | 'load',
}


@Component({
  standalone: true,
  selector: 'app-items-finder',
  imports: [CommonModule, ImageComponent, MultiSelectDropdownComponent, ButtonComponent, ItemComponent],
  template: `
  <div>
    <div class="search-row">
      <input
        type="text"
        class="fulltext-input"
        placeholder="Search items by name..."
        (input)="filterByFullText($event.target.value)"
        [value]="state().filters.fullText"
      />
    </div>
    <div class="controls-row">
      <div class="view-toggle">
        <ds-button
          [mode]="viewMode() === 'table' ? 'primary' : 'tertiary'"
          (click)="setViewMode('table')"
        >
          Table
        </ds-button>
        <ds-button
          [mode]="viewMode() === 'grid' ? 'primary' : 'tertiary'"
          (click)="setViewMode('grid')"
        >
          Grid
        </ds-button>
      </div>
    </div>
    <ds-multi-select-dropdown [items]="allRarities()" (selectionChange)="filterByRarity($event)">
      Rarity
    </ds-multi-select-dropdown>

    <ds-multi-select-dropdown [items]="allTags()" (selectionChange)="filterByTags($event)">
      Tags
    </ds-multi-select-dropdown>
  </div>

  @if (viewMode() === 'table') {
    <div class="table-wrapper">
      <table>
      <thead>
        <tr>
          <th>Icon</th>
          <th>Name</th>
          <th>Tags</th>
          <th>Rarity</th>
          <th>Weight</th>
        </tr>
      </thead>
      <tbody>
        @for(item of state().data; track item.id) {
          <tr (click)="itemClicked.emit(item)">
            <td><ds-image [src]="item.path" [alt]="item.name" size="medium" /></td>
            <td>{{ item.name }}</td>
            <td>{{ item.tags.join(', ') }}</td>
            <td>{{ item.rarity }}</td>
            <td>{{ item.weight }}</td>
          </tr>
        }
      </tbody>
      </table>
    </div>
  }

  @if (viewMode() === 'grid') {
    <div class="grid-wrapper">
      <div class="grid">
        @for(item of state().data; track item.id) {
          <app-item [item]="item" (itemClicked)="itemClicked.emit($event)"></app-item>
        }
      </div>
    </div>
  }

  <div class="pagination-controls">
    <ds-button
      [mode]="'tertiary'"
      (click)="pagination().pageIndex === 0 ? null : prevPage()"
      [class.disabled]="pagination().pageIndex === 0"
    >
      Prev
    </ds-button>
    <span>Page {{ pagination().pageIndex + 1 }} / {{ totalPages() }}</span>
    <ds-button
      [mode]="'tertiary'"
      (click)="pagination().pageIndex >= totalPages() - 1 ? null : nextPage()"
      [class.disabled]="pagination().pageIndex >= totalPages() - 1"
    >
      Next
    </ds-button>
  </div>
  `,
  styles: [`
    :host {
      display: flex;
      height: 100%;
      width: 100%;
      flex-direction: column;
    }`,
  `
    .table-wrapper {
      /* allow the table to grow and scroll within the component */
      flex: 1 1 auto;
      min-height: 0; /* allow children to shrink inside flex container */
      overflow: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 0;
      gap: 12px;
      /* keep paginator visually separated from the table */
      border-top: 1px solid rgba(0,0,0,0.06);
    }
    .pagination-controls ds-button.disabled {
      pointer-events: none;
      opacity: 0.6;
    }
      .controls-row {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 8px;
      }

      .view-toggle {
        display: flex;
        gap: 8px;
      }

      .grid-wrapper {
        flex: 1 1 auto;
        min-height: 0;
        overflow: auto;
        padding: 8px 0;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(var(--item-size), 1fr));
        gap: 12px;
      }
      .search-row {
        display: flex;
        gap: 8px;
        margin-bottom: 8px;
      }

      .fulltext-input {
        flex: 1 1 auto;
        padding: 8px 10px;
        border: 1px solid var(--color-border);
        border-radius: 6px;
        background: var(--color-background-secondary);
        color: var(--text-primary);
        font-size: var(--text-size-medium);
      }
  `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemsFinderComponent {
  public state = input.required<ItemsFinderState>();
  public newState = output<ItemsFinderState>();
  public itemClicked = output<Item>();
  protected _state = linkedSignal(this.state);
  public viewMode = signal<'table' | 'grid'>('grid');
  protected allRarities = computed(() => {
    return Object.values(ItemRarityFilters).map(rarity => ({
      ...rarity,
      selected: this._state().filters.rarity.includes(rarity.id),
    }));
  });

  protected allTags = computed(() => {
    return Object.values(ItemTagFilters).map(tag => ({
      ...tag,
      selected: this._state().filters.tags.includes(tag.id),
    }));
  });

  public pagination = computed(() => this._state().pagination);

  public totalPages = computed(() => {
    const s = this._state();
    const total = s.count ?? 0;
    const pageSize = s.pagination.pageSize;
    return Math.max(1, Math.ceil(total / pageSize));
  });

  // Debounce timer for full-text input to avoid spamming parent updates
  protected _fullTextDebounce: ReturnType<typeof setTimeout> | null = null;
  protected _fullTextDebounceDelay = 250; // milliseconds



  constructor() {
    effect(() => {
      this.newState.emit(this._state());
    });
  }

  public setViewMode(mode: 'table' | 'grid') {
    this.viewMode.set(mode);
  }

  protected filterByRarity(selected: DSOption[]) {
    this._state.update((s: ItemsFinderState) => {
      s.filters.rarity = selected.filter(opt => opt.selected).map(opt => opt.id as ItemRarity);
      s.lastAction = 'filter';
      return structuredClone(s);
    });
  }

  protected filterByTags(selected: DSOption[]) {
    this._state.update((s: ItemsFinderState) => {
      s.filters.tags = selected.filter(opt => opt.selected).map(opt => opt.id as ItemTag);
      s.lastAction = 'filter';
      return structuredClone(s);
    });
  }

  protected filterByFullText(value: string) {
    // debounce updates so parent isn't notified on every keystroke
    if (this._fullTextDebounce) {
      clearTimeout(this._fullTextDebounce);
    }
    this._fullTextDebounce = setTimeout(() => {
      this._state.update((s: ItemsFinderState) => {
        s.filters.fullText = value;
        s.lastAction = 'filter';
        return structuredClone(s);
      });
      this._fullTextDebounce = null;
    }, this._fullTextDebounceDelay);
  }

  protected prevPage() {
    const current = this._state().pagination.pageIndex;
    const next = Math.max(0, current - 1);
    this._state.update((s: ItemsFinderState) => {
      s.pagination.pageIndex = next;
      s.lastAction = 'paginate';
      return structuredClone(s);
    });
  }

  protected nextPage() {
    const current = this._state().pagination.pageIndex || 0;
    const next = Math.min(this.totalPages() - 1, current + 1);
    this._state.update((s: ItemsFinderState) => {
      s.pagination.pageIndex = next;
      s.lastAction = 'paginate';
      return structuredClone(s);
    });
  }

  protected changePageSize(value: string | number) {
    const size = Number(value) || 10;
    this._state.update((s: ItemsFinderState) => {
      s.pagination.pageSize = size;
      // Ensure current page is within new bounds
      const maxIndex = Math.max(0, Math.ceil(s.data.length / size) - 1);
      s.pagination.pageIndex = Math.min(s.pagination.pageIndex, maxIndex);
      s.lastAction = 'paginate';
      return structuredClone(s);
    });
  }

}