import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { ButtonComponent } from '../design-system/button.component';
import { CardComponent } from '../design-system/card.component';
import { ImageComponent } from '../design-system/image.component';

export type PictureItem = { name: string, path: string };
@Component({
  selector: 'app-picture-gallery',
  template: `
    <ds-card>
      <input 
        type="text" 
        class="search-input"
        placeholder="Search items..."
        [value]="searchQuery()"
        (input)="onSearchInput($event)"
      />
      
      <div 
        class="gallery-container"
        (touchstart)="onTouchStart($event)"
        (touchend)="onTouchEnd($event)"
      >
        <div class="gallery">
          @for (item of paginatedItems(); track item.name) {
            <button type="button" class="gallery-item" (click)="selectItem(item)">
              <ds-image
                [src]="item.path" 
                [alt]="item.name"
                size="small"
                shape="rectangle"
              />
              <span class="item-name">{{ item.name }}</span>
            </button>
          }
        </div>
      </div>
      
      <div class="pagination">
        <ds-button 
          mode="secondary"
          icon="arrow-left"
          [state]="{ state: 'default' }"
          (click)="goToPage(1)"
          [attr.disabled]="currentPage() === 1 ? '' : null"
        />
        <ds-button 
          mode="secondary"
          icon="arrow-left"
          [state]="{ state: 'default' }"
          (click)="previousPage()"
          [attr.disabled]="currentPage() === 1 ? '' : null"
        />
        <span class="pagination-info">
          Page {{ currentPage() }} / {{ totalPages() }}
          <span class="pagination-count">({{ filteredItems().length }} items)</span>
        </span>
        <ds-button 
          mode="secondary"
          icon="arrow-right"
          [state]="{ state: 'default' }"
          (click)="nextPage()"
          [attr.disabled]="currentPage() === totalPages() ? '' : null"
        />
        <ds-button 
          mode="secondary"
          icon="arrow-right"
          [state]="{ state: 'default' }"
          (click)="goToPage(totalPages())"
          [attr.disabled]="currentPage() === totalPages() ? '' : null"
        />
      </div>
    </ds-card>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }

    .search-input {
      width: 100%;
      padding: var(--padding-small);
      margin-bottom: var(--gap-medium);
      border: 1px solid var(--color-border);
      border-radius: var(--view-border-radius);
      background: var(--color-background-tertiary);
      color: var(--text-primary);
      font-size: var(--text-size-medium);
      transition: border-color var(--transition-speed);
    }

    .search-input:focus {
      outline: none;
      border-color: var(--color-primary);
    }

    .search-input::placeholder {
      color: var(--text-tertiary);
    }

    .gallery-container {
      touch-action: pan-y;
      user-select: none;
    }

    .gallery {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: var(--gap-medium);
      margin-bottom: var(--gap-medium);
    }

    @media (min-width: 768px) {
      .gallery {
        grid-template-columns: repeat(4, 1fr);
      }
    }

    .gallery-item {
      background: var(--color-background-tertiary);
      padding: var(--padding-small);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--gap-small);
      border: 2px solid var(--color-border);
      border-radius: var(--view-border-radius);
      transition: all var(--transition-speed);
    }

    .gallery-item:hover {
      border-color: var(--color-primary);
      background: var(--color-surface-elevated);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px var(--color-shadow-heavy);
    }

    .gallery-item:active {
      transform: translateY(0);
    }

    .item-name {
      font-size: var(--text-size-small);
      color: var(--text-secondary);
      text-align: center;
      word-break: break-word;
      line-height: 1.2;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--gap-small);
      margin-top: var(--gap-medium);
      flex-wrap: wrap;
      padding-top: var(--gap-medium);
      border-top: 1px solid var(--color-border);
    }

    .pagination-info {
      padding: 0 var(--gap-medium);
      font-size: var(--text-size-medium);
      color: var(--text-primary);
      font-weight: var(--text-weight-medium);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }

    .pagination-count {
      font-size: var(--text-size-small);
      color: var(--text-secondary);
      font-weight: var(--text-weight-normal);
    }

    ds-button[disabled] {
      pointer-events: none;
      opacity: 0.5;
    }
  `],
  imports: [ImageComponent, ButtonComponent, CardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PictureGalleryComponent {
  public items = input.required<PictureItem[]>();
  public itemsPerPage = input<number>(6);
  public itemSelected = output<PictureItem>();

  protected searchQuery = signal('');
  protected currentPage = signal(1);
  
  private touchStartX = 0;
  private touchStartY = 0;
  private readonly minSwipeDistance = 50;
  
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

  public onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;
  }

  public onTouchEnd(event: TouchEvent): void {
    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;
    
    const deltaX = touchEndX - this.touchStartX;
    const deltaY = touchEndY - this.touchStartY;
    
    // Only trigger swipe if horizontal movement is greater than vertical
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > this.minSwipeDistance) {
      if (deltaX > 0) {
        // Swipe right - go to previous page
        this.previousPage();
      } else {
        // Swipe left - go to next page
        this.nextPage();
      }
    }
  }
}
