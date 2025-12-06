import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AttributeInventory } from '@pagemaster/common/attributes.types';
import { ImageComponent } from '../../../design-system/image.component';

@Component({
  selector: 'app-item-placeholder',
  host: {
    '[class.disabled]': '!canAdd()',
  },
  template: `
    <ds-image [icon]="iconName()" [size]="'s'" />
    <div class="text">{{ mode() === 'weight' ? 'Empty' : 'Add' }}</div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--gap-small);
      height: var(--item-component-m);
      width: var(--item-component-m);
      border: var(--item-border-width) dashed var(--color-border);
      border-radius: var(--item-component-border-radius);
      position: relative;
      cursor: pointer;
      transition: opacity var(--item-transition-speed) ease;

      --disabled-opacity: 0.4;
      &.disabled {
        cursor: not-allowed;
        opacity: var(--disabled-opacity);
      }
      &.disabled:hover {
        opacity: var(--disabled-opacity);
      }

      .text {
        font-size: var(--text-size-small);
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ImageComponent],
})
export class ItemPlaceholderComponent {
  public mode = input.required<AttributeInventory['capacity']['type']>();
  public size = input<'s' | 'm'>('m');
  public canAdd = input<boolean>(false);

  protected iconName = computed(() => {
    return this.mode() === 'weight' ? 'empty' : 'plus';
  });
}
