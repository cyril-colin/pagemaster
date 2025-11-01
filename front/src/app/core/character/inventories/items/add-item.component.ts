import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { Item } from '@pagemaster/common/items.types';
import { ModalService } from '../../../modal';
import { InventoryItemEvent } from '../inventory-list.component';
import { ItemListPermissions } from '../item-list.component';
import { ItemModalComponent } from './item-modal.component';

@Component({
  selector: 'app-add-item',
  template: `
    <button type="button" class="add-item-btn" (click)="openItemGallery()" title="Add new item">
      <span class="icon">➕</span>
      <span class="label">Add Item</span>
    </button>
  `,
  styles: [`
    .add-item-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: transparent;
      border: 1px solid var(--color-border, #ccc);
      cursor: pointer;
    }

    .add-item-btn:hover {
      border-color: var(--color-primary, #000);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddItemComponent {
  public itemAdded = output<Omit<InventoryItemEvent, 'inventory'>>();
  public permissions = input.required<ItemListPermissions>();
  
  private modalService = inject(ModalService);

  protected openItemGallery() {
    const ref = this.modalService.open(ItemModalComponent, {permissions: this.permissions()});
    ref.componentRef.instance.editItem.subscribe((newItem: Item) => {
      this.itemAdded.emit({ item: newItem, modalRef: ref });
    });
  }
}
