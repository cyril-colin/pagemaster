import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Item } from '@pagemaster/common/items.types';
import { ImageComponent } from '../../../design-system/image.component';
import { ItemWeightComponent } from './item-weight.component';

@Component({
  selector: 'app-item',
  template: `
    <div class="item" (click)="itemClicked.emit(item())">
      <ds-image [src]="item().picture" [alt]="item().name" size="medium" />
      <div>{{ item().name }}</div>
      <app-item-weight [weight]="item().weight" />
    </div>
  `,
  styles: [`
    .item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      height: var(--item-size);
      width: var(--item-size);
      border: var(--item-border-width) solid var(--color-border);
      border-radius: var(--item-border-radius);
      cursor: pointer;
      transition: opacity var(--item-transition-speed) ease, 
                  border-color var(--item-transition-speed) ease;
      position: relative;
      background: var(--color-background-secondary);
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
  public itemClicked = output<Item>();
}
