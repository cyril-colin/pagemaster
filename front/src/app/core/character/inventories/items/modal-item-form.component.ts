import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Item } from '@pagemaster/common/items.types';
import { ItemFormComponent } from './item-form.component';

@Component({
  selector: 'app-modal-item-form',
  template: `
  @let item = existingItem();
    <app-item-form [existingItem]="item" (itemSubmitted)="itemSubmitted.emit($event)"/>
    @if (item) {
      <button type="button" (click)="deleteAction.emit(item)">Remove Item</button>
    }
  `,
  styles: [''],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ItemFormComponent],
})
export class ModalItemFormComponent {
  public existingItem = input<Item | null>(null);
  public itemSubmitted = output<Item>();
  public deleteAction = output<Item | null>();
}