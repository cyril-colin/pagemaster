import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, output } from '@angular/core';
import { Item } from '@pagemaster/common/items.types';
import { Character } from '@pagemaster/common/pagemaster.types';
import { CurrentSessionState } from '../../current-session.state';
import { ModalService } from '../../modal';
import { Inventory } from './inventory.types';
import { ModalItemFormComponent } from './items/modal-item-form.component';

@Component({
  selector: 'app-inventory-view-details',
  template: `  
    <div class="items">
      @for(item of sortedItems(); track item.id) {
        <div class="item" (click)="openItemGallery(item)">
          <img [src]="item.picture" [alt]="item.name" width="32" height="32"/>
          <div>{{ item.name }}</div>
          <div> weight : {{ item.weight  }}</div>
        </div>
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
      height: var(--icon-button-size);
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
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryViewDetailsComponent {
  public character = input.required<Character>();
  public inventory = input.required<Inventory>();
  protected inventoryState = linkedSignal(this.inventory);
  public newInventory = output<Inventory>();
  protected modalService = inject(ModalService);

  protected sortedItems = computed(() => {
    return this.inventoryState().instance.current.sort((a, b) => b.weight - a.weight);
  });

  private currentSessionState = inject(CurrentSessionState);
  protected isManager = this.currentSessionState.allowedToEditCharacter(this.character);

  protected deleteItem(item: { id: string }) {
    const state = this.inventoryState();
    state.instance.current = state.instance.current.filter(i => i.id !== item.id);
    this.inventoryState.set(state);
    this.newInventory.emit(state);
  }

  protected openItemGallery(item: Item) {
    const ref = this.modalService.open(ModalItemFormComponent, {
      existingItem: item,
    });
    ref.componentRef.instance.itemSubmitted.subscribe((newItem: Item) => {
      this.inventoryState().instance.current = this.inventoryState().instance.current.map(i => i.id === newItem.id ? newItem : i);
      this.inventoryState.set(this.inventoryState());
      this.newInventory.emit(this.inventoryState());
      ref.close();
    });

    ref.componentRef.instance.deleteAction.subscribe(() => {
      this.deleteItem(item);
      ref.close();
    });
  }
}
