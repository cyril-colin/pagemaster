import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Item } from '@pagemaster/common/items.types';

@Component({
  selector: 'app-item',
  template: `
    <div class="item" (click)="itemClicked.emit(item())">
      <img [src]="item().picture" [alt]="item().name"/>
      <div>{{ item().name }}</div>
      <div>weight: {{ item().weight }}</div>
    </div>
  `,
  styles: [`
    .item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      --item-size: 130px;
      --img-size: 64px;
      height: var(--item-size);
      width: var(--item-size);
      cursor: pointer;
      
      img {
        width: var(--img-size);
        height: var(--img-size);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemComponent {
  public item = input.required<Item>();
  public itemClicked = output<Item>();
}
