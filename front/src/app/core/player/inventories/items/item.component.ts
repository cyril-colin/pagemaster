import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Item, ItemRarity } from '@pagemaster/common/items.types';
import { ImageComponent } from '../../../design-system/image.component';
import { ItemWeightComponent } from './item-weight.component';

@Component({
  selector: 'app-item',
  template: `
    <div class="item"
      (click)="itemClicked.emit(item())"
      [style.border-color]="getBorderColor(item().rarity)"
      [class.item-medium]="mode() === 'default'"
      [class.item-small]="mode() === 'compact'"
    >
      <ds-image [src]="item().path" [alt]="item().name" size="medium" />
      @if (mode() === 'default') {
        <p>{{ item().name }}</p>
        <app-item-weight [weight]="item().weight" />
      }
    </div>
  `,
  styles: [`
    .item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--gap-small);
      border: var(--item-border-width) solid var(--color-border);
      border-radius: var(--item-border-radius);
      cursor: pointer;
      transition: opacity var(--item-transition-speed) ease, 
                  border-color var(--item-transition-speed) ease;
      position: relative;
      background: var(--color-background-secondary);

      p {
        width: 100%;
        text-align: center;
      }
    }

    .item-medium {
      height: var(--item-size-medium);
      width: var(--item-size-medium);
    }

    .item-small {
      height: var(--item-size-small);
      width: var(--item-size-small);
    }

    .item app-item-weight {
      position: absolute;
      top: 6px;
      right: 6px;
    }

    .item:hover {
      opacity: 0.8;
      border-color: var(--color-primary);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ItemWeightComponent, ImageComponent],
})
export class ItemComponent {
  public item = input.required<Item>();
  public mode = input<'default' | 'compact'>('default');
  public itemClicked = output<Item>();

  public getBorderColor(rarity: ItemRarity): string {
    switch (rarity) {
      case ItemRarity.COMMON:
        return 'var(--color-uncommon, #357738ff)';
      case ItemRarity.RARE:
        return 'var(--color-rare, #2196f3)';
      case ItemRarity.EPIC:
        return 'var(--color-epic, #9c27b0)';
      case ItemRarity.LEGENDARY:
        return 'var(--color-legendary, #ffc107)';
      default:
        return 'var(--color-border)';
    }
  }
}
