import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Item } from '@pagemaster/common/items.types';
import { ButtonComponent } from 'src/app/core/design-system/button.component';
import { InventoryPermissions } from '../inventory.component';
import { ItemFormComponent } from './item-form.component';

@Component({
  selector: 'app-item-modal',
  template: `
  @let item = existingItem();
    <app-item-form [existingItem]="item" (itemSubmitted)="editItem.emit($event)" [permissions]="permissions()"/>
    @if (item && permissions().delete) {
      <ds-button [mode]="'secondary-danger'" (click)="deleteItem.emit(item)" [icon]="'empty'">Remove Item</ds-button>
    }
  `,
  styles: [''],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ItemFormComponent, ButtonComponent],
})
export class ItemModalComponent {
  public existingItem = input<Item | null>(null);
  public permissions = input.required<InventoryPermissions>();
  public editItem = output<Item>();
  public deleteItem = output<Item | null>();
}