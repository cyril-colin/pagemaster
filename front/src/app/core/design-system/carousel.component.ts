import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, contentChild, effect, input, output, signal, TemplateRef } from '@angular/core';

@Component({
  selector: 'ds-carousel',
  standalone: true,
  template: `
    <div class="carousel-container">

      <div class="carousel-track" [style.transform]="'translateX(-' + (currentIndex() * 100) + '%)'">
        @for(item of items(); track trackBy()(i, item); let i = $index) {
          <div class="carousel-slide">
            <ng-container *ngTemplateOutlet="itemTemplate(); context: { $implicit: item, index: i }"></ng-container>
          </div>
        }
      </div>

      <!-- large floating nav buttons removed; use mini nav beside indicators -->
    </div>

    @if(showIndicators() && items().length > 1) {
      <div class="indicators">
        @if(showNavigation() && currentIndex() > 0) {
          <button class="indicator-nav indicator-nav-left" (click)="previous()" aria-label="Previous">
            <span class="arrow">‹</span>
          </button>
        }
        @for(item of items(); track trackBy()(i, item); let i = $index) {
          <button 
            class="indicator"
            [class.active]="i === currentIndex()"
            (click)="goTo(i)"
            [attr.aria-label]="'Go to item ' + (i + 1)"
          ></button>
        }
        @if(showNavigation() && currentIndex() < items().length - 1) {
          <button class="indicator-nav" (click)="next()" aria-label="Next">
            <span class="arrow">›</span>
          </button>
        }
      </div>
    }
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
    }

    .carousel-container {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    .carousel-track {
      display: flex;
      height: 100%;
      transition: transform 0.3s ease-in-out;
    }

    .carousel-slide {
      flex: 0 0 100%;
      width: 100%;
      height: 100%;
    }

    /* large floating nav buttons removed; keep small arrow sizing under .indicator-nav */

    .indicators {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: var(--gap-small);
      padding: var(--padding-medium) 0;
    }

    .indicator {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 2px solid var(--color-border);
      background: transparent;
      cursor: pointer;
      transition: all 0.2s ease;
      padding: 0;
    }

    .indicator:hover {
      border-color: var(--color-primary);
      transform: scale(1.2);
    }

    .indicator.active {
      background: var(--color-primary);
      border-color: var(--color-primary);
    }

    /* Small nav button placed next to indicators */
    .indicator-nav {
      margin-left: var(--gap-small);
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--color-background-secondary);
      border: 2px solid var(--color-border);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--text-primary);
      transition: all 0.18s ease;
      box-shadow: 0 3px 8px rgba(0,0,0,0.35);
      padding: 0;
    }

    .indicator-nav:hover {
      background: var(--color-primary);
      border-color: var(--color-primary);
      color: white;
      transform: scale(1.05);
    }

    .indicator-nav .arrow {
      font-size: 1.25rem;
      line-height: 1;
      font-weight: 700;
    }

    .indicator-nav-left {
      margin-left: 0;
      margin-right: var(--gap-small);
    }
  `],
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarouselComponent<T> {
  public items = input.required<T[]>();
  public initialIndex = input<number>(0);
  public showNavigation = input<boolean>(true);
  public showIndicators = input<boolean>(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public trackBy = input<(index: number, item: T) => unknown>((index, __item) => index);

  // New: allow parent to control the current index
  public index = input<number | undefined>(undefined);

  public indexChange = output<number>();

  public currentIndex = signal<number>(0);
  
  // Content child to get the template from parent
  public itemTemplate = contentChild.required<TemplateRef<{ $implicit: T, index: number }>>('carouselItem');

  constructor() {
    // Set initial index when component initializes
    effect(() => {
      // If parent provides [index], use it; else fallback to initialIndex
      const idx = this.index() ?? this.initialIndex();
      const itemsLength = this.items().length;
      if (idx >= 0 && idx < itemsLength) {
        this.currentIndex.set(idx);
      }
    });
  }

  public next(): void {
    const current = this.currentIndex();
    const maxIndex = this.items().length - 1;
    if (current < maxIndex) {
      const newIndex = current + 1;
      this.currentIndex.set(newIndex);
      this.indexChange.emit(newIndex);
    }
  }

  public previous(): void {
    const current = this.currentIndex();
    if (current > 0) {
      const newIndex = current - 1;
      this.currentIndex.set(newIndex);
      this.indexChange.emit(newIndex);
    }
  }

  public goTo(index: number): void {
    if (index >= 0 && index < this.items().length) {
      this.currentIndex.set(index);
      this.indexChange.emit(index);
    }
  }
}
