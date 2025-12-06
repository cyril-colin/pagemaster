import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Item, ItemRarity } from '@pagemaster/common/items.types';
import { ImageComponent } from '../../../design-system/image.component';
import { ItemWeightComponent } from './item-weight.component';

@Component({
  selector: 'app-item',
  host: {
    '[style.border-color]': 'borderColor()',
    // eslint-disable-next-line quotes
    '[class.size-s]': "size() === 's'",
    // eslint-disable-next-line quotes
    '[class.size-xs]': "size() === 'xs'",
  },
  template: `
    <ds-image [src]="item().path" [alt]="item().name" [size]="size()" />
    @if(size() !== 'xs') {
      <app-item-weight [weight]="item().weight" />
    }
  `,
  styles: [`
    :host {
      display: flex;
      width: var(--item-component-m);
      height: var(--item-component-m);
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--gap-small);
      border: var(--item-border-width) solid var(--color-border);
      border-radius: var(--item-component-border-radius);
      background: var(--color-background-secondary);
      position: relative;

      &.size-s {
        width: var(--item-component-s);
        height: var(--item-component-s);
      }
      &.size-xs {
        width: var(--item-component-xs);
        height: var(--item-component-xs);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ItemWeightComponent, ImageComponent],
})
export class ItemComponent {
  public item = input.required<Item>();
  public size = input<'m' | 's' | 'xs'>('m');

  protected borderColor = computed(() => {
    switch (this.item().rarity) {
      case ItemRarity.COMMON:
        return 'var(--item-component-color-uncommon)';
      case ItemRarity.RARE:
        return 'var(--item-component-color-rare)';
      case ItemRarity.EPIC:
        return 'var(--item-component-color-epic)';
      case ItemRarity.LEGENDARY:
        return 'var(--item-component-color-legendary)';
      default:
        return 'var(--color-border)';
    }
  });
}
