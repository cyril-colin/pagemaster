import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { Item } from '@pagemaster/common/items.types';
import { ModalService } from '../../../modal';
import { ModalItemFormComponent } from './modal-item-form.component';

@Component({
  selector: 'app-add-item-button',
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
export class AddItemButtonComponent {
  public itemAdded = output<Item>();
  
  private modalService = inject(ModalService);

  protected openItemGallery() {
    const ref = this.modalService.open(ModalItemFormComponent);
    ref.componentRef.instance.itemSubmitted.subscribe((newItem: Item) => {
      this.itemAdded.emit(newItem);
      ref.close();
    });
  }
}
