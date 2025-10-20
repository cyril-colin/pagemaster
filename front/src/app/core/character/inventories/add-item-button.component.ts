import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { Item } from '@pagemaster/common/items.types';
import { ITEM_ICONS } from '../../gallery/item-icons.const';
import { PictureGalleryComponent, PictureItem } from '../../gallery/picture-gallery.component';
import { ModalService } from '../../modal';

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
    const ref = this.modalService.open(PictureGalleryComponent, {
      items: ITEM_ICONS,
    });
    
    ref.componentRef.instance.itemSelected.subscribe((picture: PictureItem) => {
      const newItem: Item = {
        id: `${picture.name}-${Date.now()}`,
        name: picture.name,
        description: '',
        weight: 0,
        picture: picture.path,
      };
      
      this.itemAdded.emit(newItem);
      ref.close();
    });
  }
}
