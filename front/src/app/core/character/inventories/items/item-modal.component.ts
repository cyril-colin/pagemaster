import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Item } from '@pagemaster/common/items.types';
import { ItemListPermissions } from '../item-list.component';
import { ItemFormComponent } from './item-form.component';

@Component({
  selector: 'app-item-modal',
  template: `
  @let item = existingItem();
    <app-item-form [existingItem]="item" (itemSubmitted)="editItem.emit($event)" [permissions]="permissions()"/>
    @if (item && permissions().delete) {
      <button type="button" (click)="deleteItem.emit(item)">Remove Item</button>
    }
  `,
  styles: [''],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ItemFormComponent],
})
export class ItemModalComponent {
  public existingItem = input<Item | null>(null);
  public permissions = input.required<ItemListPermissions>();
  public editItem = output<Item>();
  public deleteItem = output<Item | null>();
}