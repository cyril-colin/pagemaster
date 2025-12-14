import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Item, ItemRarity } from '@pagemaster/common/items.types';
import { ImageComponent, ImageSize } from '../../../design-system/image.component';

@Component({
  selector: 'app-item-description',
  standalone: true,
  template: `
            <div class="item-description"
              [class.rarity-common]="item().rarity === ItemRarity.COMMON"
              [class.rarity-uncommon]="item().rarity === ItemRarity.UNCOMMON"
              [class.rarity-rare]="item().rarity === ItemRarity.RARE"
              [class.rarity-epic]="item().rarity === ItemRarity.EPIC"
              [class.rarity-legendary]="item().rarity === ItemRarity.LEGENDARY"
            >
      <ds-image class="item-image" [src]="item().path" [alt]="item().name" [size]="'xl'" />
      <h3 class="item-name">{{ item().name }}</h3>
      <section class="item-details">
        <article class="detail-row">
          <span class="detail-label">Weight:</span>
          <span class="detail-value">{{ item().weight }}</span>
        </article>
        <article class="detail-row">
          <span class="detail-label">Rarity:</span>
          <span class="detail-value">{{ item().rarity }}</span>
        </article>
        <article class="detail-row">
          <span class="detail-label">Tags:</span>
          <span class="detail-value">{{ item().tags.join(', ') }}</span>
        </article>
      </section>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .item-description {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0;
      padding: var(--padding-small);
      border-radius: var(--item-component-border-radius);
      border: 2px solid transparent;
      background: linear-gradient(180deg, rgba(255,255,255,0.02), transparent);
    }

    .item-image {
      flex-shrink: 0;
      margin-bottom: var(--gap-small);
      margin-top: 0;
      /* Use the new xl size variable if available */
      --ds-image-component-size-xl: 140px;
      border-radius: 8px;
      overflow: hidden;
      border: 3px solid transparent;
      transition: box-shadow 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
    }

    /* Rarity-specific visuals */
    .item-description.rarity-uncommon {
      border-color: var(--item-component-color-uncommon);
    }

    .item-description.rarity-rare {
      border-color: var(--item-component-color-rare);
    }

    .item-description.rarity-epic {
      border-color: var(--item-component-color-epic);
    }

    .item-description.rarity-legendary {
      border-color: var(--item-component-color-legendary);
    }


    .item-name {
      margin: 0;
      font-size: 0.9rem;
      font-weight: 700;
      text-align: center;
      color: var(--color-text);
    }

    .item-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
      width: 100%;
      max-width: 250px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 8px;
      background: var(--color-background-secondary);
      border-radius: var(--border-radius);
    }

    .detail-label {
      color: var(--color-text-secondary);
      font-size: var(--text-size-small);
    }

    .detail-value {
      font-weight: var(--text-weight-bold);
      color: var(--color-text);
      font-size: var(--text-size-small);
    }
  `],
  imports: [ImageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemDescriptionComponent {
  public item = input.required<Item>();
  public size = input<ImageSize>('l');
  // Expose the enum to the template for safe comparisons
  public ItemRarity = ItemRarity;
}
