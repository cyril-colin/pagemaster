import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  input,
  linkedSignal,
  output,
  signal,
  viewChild,
} from '@angular/core';
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
  selection: Item[],
  lastAction: 'filter' | 'paginate' | 'load' | 'selection',
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
    
    <ds-multi-select-dropdown [items]="allRarities()" (selectionChange)="filterByRarity($event)">
      Rarity
    </ds-multi-select-dropdown>

    <ds-multi-select-dropdown [items]="allTags()" (selectionChange)="filterByTags($event)">
      Tags
    </ds-multi-select-dropdown>
  </div>

  <div class="controls-row">
      <div class="selection-controls">
        <ds-button (click)="selectAll()" mode="secondary">Select all</ds-button>
        <ds-button (click)="unselectAll()" mode="tertiary">Unselect all</ds-button>
      </div>
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

  @if (viewMode() === 'table') {
    <div class="table-wrapper" #tableWrapper (scroll)="onScroll('table', $event)">
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
          <tr (click)="select(item)" [class.selected]="isSelected(item)">
            <td class="icon-cell">
              <ds-image [src]="item.path" [alt]="item.name" [size]="'m'" />
              <span class="selected-check" aria-hidden="true">✓</span>
            </td>
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
    <div class="grid-wrapper" #gridWrapper (scroll)="onScroll('grid', $event)">
      <div class="grid">
        @for(item of state().data; track item.id) {
          <app-item class="grid-item" [class.selected]="isSelected(item)" [item]="item" (click)="select(item)"></app-item>
        }
      </div>
    </div>
  }
  
  <!-- Infinite scroll: scroll handlers on wrappers will trigger loading more pages -->
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
        justify-content: space-between;
        flex-wrap: wrap;
        align-items: center;
        margin-bottom: 8px;
        gap: 12px;
      }

      .selection-controls {
        display: flex;
        gap: 8px;
        align-items: center;
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
        grid-template-columns: repeat(auto-fill, minmax(var(--item-component-m), 1fr));
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
      
      /* Selected state styles */
      table tr.selected {
        background-color: rgba(11,120,255,0.06);
      }
      table tr:hover {
        background-color: rgba(0,0,0,0.02);
        cursor: pointer;
      }

      /* selected check inside the image cell */
      .icon-cell {
        position: relative;
      }
      .selected-check {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        top: -6px;
        left: -6px;
        width: 22px;
        height: 22px;
        font-weight: 700;
        font-size: 14px;
        color: white;
        background: var(--color-accent, #0b78ff);
        border-radius: 999px;
        box-shadow: 0 3px 8px rgba(0,0,0,0.12);
        transform: scale(0.95);
        transition: transform 120ms ease, opacity 120ms ease;
        opacity: 0;
        pointer-events: none;
      }
      tr.selected .selected-check {
        opacity: 1;
        transform: scale(1);
      }

      .grid .grid-item {
        position: relative;
        transition: box-shadow 120ms ease, transform 120ms ease, border-color 120ms ease;
      }
      .grid .grid-item.selected {
        box-shadow: 0 6px 18px rgba(11,120,255,0.08);
        transform: translateY(-2px);
        border-radius: 8px;
      }
      /* checkmark overlay for grid items (host-level pseudo element)
         positioned bottom-right; no selected border so the badge sits over the icon */
      .grid .grid-item.selected::after {
        content: '✓';
        position: absolute;
        top: 8px;
        right: 8px;
        width: 20px;
        height: 20px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: var(--color-accent, #0b78ff);
        color: #fff;
        border-radius: 999px;
        font-weight: 700;
        font-size: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.12);
        pointer-events: none;
      }
  `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemsFinderComponent {
  public state = input.required<ItemsFinderState>();
  public newState = output<ItemsFinderState>();

  protected _state = linkedSignal(this.state);
  public viewMode = signal<'table' | 'grid'>('grid');
  public tableRef = viewChild<ElementRef<HTMLElement>>('tableWrapper');
  public gridRef = viewChild<ElementRef<HTMLElement>>('gridWrapper');
  // Prevent duplicate load triggers while a page is being requested
  protected _infiniteScrollLoading = false;
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


  protected select(item: Item) {
    this._state.update((s: ItemsFinderState) => {
      const index = s.selection.findIndex(i => i.id === item.id);
      if (index >= 0) {
        s.selection.splice(index, 1);
      } else {
        s.selection.push(item);
      }
      s.lastAction = 'selection';
      return structuredClone(s);
    });
  }

  // Used by the template to determine whether a given item is selected
  public isSelected(item: Item): boolean {
    return this._state().selection.some(i => i.id === item.id);
  }

  // Select all items currently loaded (visible) in the finder
  public selectAll(): void {
    this._state.update((s: ItemsFinderState) => {
      s.selection = s.data.slice();
      s.lastAction = 'selection';
      return structuredClone(s);
    });
  }

  // Unselect all items
  public unselectAll(): void {
    this._state.update((s: ItemsFinderState) => {
      s.selection = [];
      s.lastAction = 'selection';
      return structuredClone(s);
    });
  }

  constructor() {
    effect(() => {
      const s = this._state();
      this.newState.emit(s);

      if (s.lastAction !== 'paginate' && s.lastAction !== 'selection') {
        const tableElem: HTMLElement | null = this.tableRef()?.nativeElement ?? null;
        const gridElem: HTMLElement | null = this.gridRef()?.nativeElement ?? null;

        if (tableElem) {
          tableElem.scrollTop = 0;
          tableElem.scrollLeft = 0;
        }
        if (gridElem) {
          gridElem.scrollTop = 0;
          gridElem.scrollLeft = 0;
        }
      }
      
    });
  }

  // Called from scroll events in template. When the user scrolls near the bottom,
  // request the next page by updating the pagination.pageIndex. A loading guard
  // avoids multiple increments while the parent processes the request.
  public onScroll(which: 'table' | 'grid', event?: Event) {
    const el = (event?.target as HTMLElement) ?? (which === 'table' ? this.tableRef()?.nativeElement : this.gridRef()?.nativeElement);
    if (!el) return;

    const threshold = 150; // px from bottom to trigger
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - threshold) {
      if (this._infiniteScrollLoading) return;
      // if already at last page, do nothing
      if (this.pagination().pageIndex >= this.totalPages() - 1) return;

      this._infiniteScrollLoading = true;
      // advance page index (nextPage does the structuredClone update and emits)
      this.nextPage();
      // release guard shortly after — parent will update state; small debounce to avoid thrash
      setTimeout(() => (this._infiniteScrollLoading = false), 400);
    }
  }

  public setViewMode(mode: 'table' | 'grid') {
    this.viewMode.set(mode);
  }

  protected filterByRarity(selected: DSOption[]) {
    this._state.update((s: ItemsFinderState) => {
      s.filters.rarity = selected.filter(opt => opt.selected).map(opt => opt.id as ItemRarity);
      s.lastAction = 'filter';
      s.pagination.pageIndex = 0;
      return structuredClone(s);
    });
  }

  protected filterByTags(selected: DSOption[]) {
    this._state.update((s: ItemsFinderState) => {
      s.filters.tags = selected.filter(opt => opt.selected).map(opt => opt.id as ItemTag);
      s.lastAction = 'filter';
      s.pagination.pageIndex = 0;
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

}