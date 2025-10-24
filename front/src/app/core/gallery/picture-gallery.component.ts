import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

export type PictureItem = { name: string, path: string };
@Component({
  selector: 'app-picture-gallery',
  template: `
    <input 
      type="text" 
      class="search-input"
      placeholder="Search items..."
      [value]="searchQuery()"
      (input)="onSearchInput($event)"
    />
    <div class="gallery">
      @for (item of paginatedItems(); track item.name) {
        <button type="button" class="gallery-item" (click)="selectItem(item)">
          <img 
            [ngSrc]="item.path" 
            [alt]="item.name"
            width="50"
            height="50"
          />
          <span class="item-name">{{ item.name }}</span>
        </button>
      }
    </div>
    <div class="pagination">
      <button 
        type="button" 
        class="pagination-btn"
        [disabled]="currentPage() === 1"
        (click)="goToPage(1)"
      >
        <<
      </button>
      <button 
        type="button" 
        class="pagination-btn"
        [disabled]="currentPage() === 1"
        (click)="previousPage()"
      >
        <
      </button>
      <span class="pagination-info">
        {{ currentPage() }} / {{ totalPages() }} ({{ filteredItems().length }} items)
      </span>
      <button 
        type="button" 
        class="pagination-btn"
        [disabled]="currentPage() === totalPages()"
        (click)="nextPage()"
      >
        >
      </button>
      <button 
        type="button" 
        class="pagination-btn"
        [disabled]="currentPage() === totalPages()"
        (click)="goToPage(totalPages())"
      >
        >>
      </button>
    </div>
  `,
  styles: [`
    .search-input {
      width: 100%;
      padding: var(--gap-small);
      margin-bottom: var(--gap-medium);
      border: 1px solid var(--color-border, #ccc);
      font-size: 1rem;
    }

    .gallery {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--gap-medium);
    }

    .gallery-item {
      background: transparent;
      padding: var(--gap-small);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--gap-small);
      border: 1px solid transparent;
    }

    .gallery-item:hover {
      border-color: var(--color-primary, #000);
    }

    .gallery-item img {
      width: 50px;
      height: 50px;
      object-fit: contain;
    }

    .item-name {
      font-size: 0.75rem;
      text-align: center;
      word-break: break-word;
      line-height: 1.2;
    }

    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--gap-small);
      margin-top: var(--gap-medium);
      flex-wrap: wrap;
    }

    .pagination-btn {
      padding: var(--gap-small);
      border: 1px solid var(--color-border, #ccc);
      background: transparent;
      cursor: pointer;
    }

    .pagination-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .pagination-btn:not(:disabled):hover {
      border-color: var(--color-primary, #000);
    }

    .pagination-info {
      padding: 0 var(--gap-small);
      font-size: 0.875rem;
    }
  `],
  imports: [NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PictureGalleryComponent {
  public items = input.required<PictureItem[]>();
  public itemsPerPage = input<number>(12);
  public itemSelected = output<PictureItem>();

  protected searchQuery = signal('');
  protected currentPage = signal(1);
  
  protected filteredItems = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) {
      return this.items();
    }
    return this.items().filter(item =>
      item.name.toLowerCase().includes(query),
    );
  });

  protected totalPages = computed(() => {
    const total = Math.ceil(this.filteredItems().length / this.itemsPerPage());
    return total > 0 ? total : 1;
  });

  protected paginatedItems = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return this.filteredItems().slice(start, end);
  });

  protected onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
    this.currentPage.set(1);
  }

  protected nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(page => page + 1);
    }
  }

  protected previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(page => page - 1);
    }
  }

  protected goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  protected selectItem(item: PictureItem): void {
    this.itemSelected.emit(item);
  }
}
