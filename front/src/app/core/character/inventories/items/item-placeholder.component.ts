import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { AttributeInventory } from '@pagemaster/common/attributes.types';
import { ImageComponent } from '../../../design-system/image.component';

@Component({
  selector: 'app-item-placeholder',
  template: `
    <div class="item-placeholder" [class.disabled]="!canAdd()" (click)="handleClick()">
      <div class="placeholder-icon">
        <ds-image 
          [icon]="iconName()"
          size="medium"
        />
      </div>
      <div class="placeholder-text">{{ mode() === 'weight' ? 'Empty' : 'Add' }}</div>
    </div>
  `,
  styles: [`
    .item-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      height: var(--item-size);
      width: var(--item-size);
      border: var(--item-border-width) dashed var(--color-border);
      border-radius: var(--item-border-radius);
      position: relative;
      cursor: pointer;
      transition: opacity var(--item-transition-speed) ease;
    }

    .item-placeholder:hover {
      opacity: 0.8;
    }

    .item-placeholder.disabled {
      cursor: not-allowed;
      opacity: 0.4;
    }

    .item-placeholder.disabled:hover {
      opacity: 0.4;
    }

    .item-placeholder::before {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--color-background-tertiary);
      border-radius: var(--item-border-radius);
      opacity: 0.3;
      z-index: -1;
    }

    .placeholder-icon {
      width: var(--item-img-size);
      height: var(--item-img-size);
      display: grid;
      place-items: center;
      color: var(--text-secondary);
    }

    .placeholder-text {
      font-size: var(--text-size-small);
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ImageComponent],
})
export class ItemPlaceholderComponent {
  public mode = input.required<AttributeInventory['capacity']['type']>();
  public canAdd = input<boolean>(false);
  public placeholderClicked = output<void>();

  protected iconName = computed(() => {
    return this.mode() === 'weight' ? 'empty' : 'plus';
  });

  protected handleClick() {
    if (this.canAdd()) {
      this.placeholderClicked.emit();
    }
  }
}
