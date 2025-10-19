import { ChangeDetectionStrategy, Component, inject, input, linkedSignal, output } from '@angular/core';
import { Item } from '@pagemaster/common/items.types';
import { Character } from '@pagemaster/common/pagemaster.types';
import { CurrentSessionState } from '../../current-session.state';
import { ITEM_ICONS } from '../../gallery/item-icons.const';
import { PictureGalleryComponent, PictureItem } from '../../gallery/picture-gallery.component';
import { ModalService } from '../../modal';
import { Inventory } from './inventories-control.component';

@Component({
  selector: 'app-inventory-view-details',
  template: `
    @let inv = inventory();
    
    <ul>
      @for(item of inv.instance.current; track item.id) {
        <img [src]="item.picture" [alt]="item.name" width="32" height="32"/>
        @if(isManager()) {
          <button (click)="deleteItem(item)">🗑️</button>
        }
      }
    </ul>

    @if(isManager()) {
      <button (click)="addItem()">➕</button>
    }
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: flex-start;
      gap: var(--gap-medium);
      width: 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryViewDetailsComponent {
  public character = input.required<Character>();
  public inventory = input.required<Inventory>();
  protected inventoryState = linkedSignal(this.inventory);
  public newInventory = output<Inventory>();
  protected modalService = inject(ModalService);

  private currentSessionState = inject(CurrentSessionState);
  protected isManager = this.currentSessionState.allowedToEditCharacter(this.character);

  protected deleteItem(item: { id: string }) {
    const state = this.inventoryState();
    state.instance.current = state.instance.current.filter(i => i.id !== item.id);
    this.inventoryState.set(state);
    this.newInventory.emit(state);
  }

  protected addItem() {
    const ref = this.modalService.open(PictureGalleryComponent, {
      items: ITEM_ICONS,
    });
    ref.componentRef.instance.itemSelected.subscribe((picture: PictureItem) => {
      const newItem: Item = {
        id: picture.name,
        name: picture.name,
        description: '',
        weight: 0,
        picture: picture.path,
      };
      const state = this.inventoryState();

      state.instance.current.push(newItem);
      this.inventoryState.set(state);
      this.newInventory.emit(state);
      ref.close();
    });
    
  } 
}
