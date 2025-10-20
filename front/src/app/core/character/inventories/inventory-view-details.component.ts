import { ChangeDetectionStrategy, Component, inject, input, linkedSignal, output } from '@angular/core';
import { Character } from '@pagemaster/common/pagemaster.types';
import { CurrentSessionState } from '../../current-session.state';
import { Inventory } from './inventory.types';

@Component({
  selector: 'app-inventory-view-details',
  template: `
    @let inv = inventory();
    
    <div class="items">
      @for(item of inv.instance.current; track item.id) {
        <div class="item">
          <img [src]="item.picture" [alt]="item.name" width="32" height="32"/>
          @if(isManager()) {
            <span class="delete" (click)="deleteItem(item)" title="Remove">×</span>
          }
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
      position: relative;
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

  private currentSessionState = inject(CurrentSessionState);
  protected isManager = this.currentSessionState.allowedToEditCharacter(this.character);

  protected deleteItem(item: { id: string }) {
    const state = this.inventoryState();
    state.instance.current = state.instance.current.filter(i => i.id !== item.id);
    this.inventoryState.set(state);
    this.newInventory.emit(state);
  }
}
