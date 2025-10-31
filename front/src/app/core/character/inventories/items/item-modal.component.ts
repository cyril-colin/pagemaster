import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Item } from '@pagemaster/common/items.types';
import { ItemFormComponent } from './item-form.component';

@Component({
  selector: 'app-item-modal',
  template: `
  @let item = existingItem();
    <app-item-form [existingItem]="item" (itemSubmitted)="editItem.emit($event)" [isManager]="isManager()"/>
    @if (item && isManager()) {
      <button type="button" (click)="deleteItem.emit(item)">Remove Item</button>
    }
  `,
  styles: [''],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ItemFormComponent],
})
export class ItemModalComponent {
  public existingItem = input<Item | null>(null);
  public isManager = input.required<boolean>();
  public editItem = output<Item>();
  public deleteItem = output<Item | null>();
}