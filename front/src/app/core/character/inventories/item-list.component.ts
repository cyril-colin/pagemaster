import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { Item } from '@pagemaster/common/items.types';
import { Character } from '@pagemaster/common/pagemaster.types';
import { CurrentSessionState } from '../../current-session.state';
import { ModalService } from '../../modal';
import { InventoryItemEvent } from './inventory-list.component';
import { Inventory } from './inventory.types';
import { ItemModalComponent } from './items/item-modal.component';
import { ItemComponent } from './items/item.component';

@Component({
  selector: 'app-item-list',
  template: `  
    <div class="items">
      @for(item of sortedItems(); track item.id) {
        <app-item [item]="item" (itemClicked)="openItemGallery($event)" />
      }
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--gap-medium);
      width: 100%;
      padding-top: var(--gap-small);
    }

    .items {
      display: flex;
      flex-wrap: wrap;
      gap: var(--gap-small);
    }

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
      img {
        width: var(--img-size);
        height: var(--img-size);
      }
    }

    

    .delete {
      position: absolute;
      top: -6px;
      right: -6px;
      width: var(--delete-button-size);
      height: var(--delete-button-size);
      display: grid;
      place-items: center;
      background: var(--color-danger);
      color: white;
      border-radius: 50%;
      font-size: var(--text-size-small);
      line-height: 0;
      cursor: pointer;
      opacity: 0.5;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .delete:hover {
      opacity: 1;
      background: var(--color-danger-hover);
      transform: scale(1.1);
    }

    .delete:active {
      transform: scale(0.95);
    }
  `],
  imports: [ItemComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemListComponent {
  public character = input.required<Character>();
  public inventory = input.required<Inventory>();
  public deleteItem = output<Omit<InventoryItemEvent, 'inventory'>>();
  public editItem = output<Omit<InventoryItemEvent, 'inventory'>>();


  protected modalService = inject(ModalService);
  protected sortedItems = computed(() => {
    return this.inventory().instance.current.sort((a, b) => b.weight - a.weight);
  });

  private currentSessionState = inject(CurrentSessionState);
  protected isManager = this.currentSessionState.allowedToEditCharacter(this.character);

  protected openItemGallery(item: Item) {
    const ref = this.modalService.open(ItemModalComponent, {
      existingItem: item,
      isManager: this.isManager(),
    });
    ref.componentRef.instance.editItem.subscribe((newItem: Item) => {
      this.editItem.emit({ item: newItem, modalRef: ref });
    });

    ref.componentRef.instance.deleteItem.subscribe(() => {
      this.deleteItem.emit({ item, modalRef: ref });
    });
  }
}
