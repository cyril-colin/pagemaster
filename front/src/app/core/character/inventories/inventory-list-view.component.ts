import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { Character } from '@pagemaster/common/pagemaster.types';
import { CurrentSessionState } from '../../current-session.state';
import { ModalService } from '../../modal';
import { Inventory } from './inventories-control.component';
import { InventoryViewDetailsComponent } from './inventory-view-details.component';
import { InventoryViewComponent } from './inventory-view.component';

@Component({
  selector: 'app-inventory-list-view',
  template: `
    @for(inventory of allowedInventories(); track inventory.instance.id) {
      <app-inventory-view [inventory]="inventory" (click)="onInventoryClick(inventory)"></app-inventory-view>
      @if(isManager()) {
        <button (click)="deleteInventory.emit(inventory)">🗑️</button>
      }
    }
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      gap: var(--gap-medium);
      width: 100%;

      button {
        border: none;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InventoryViewComponent],
})
export class InventoryListViewComponent {
  private currentSessionState = inject(CurrentSessionState);
  public character = input.required<Character>();
  public inventories = input.required<Inventory[]>();
  public deleteInventory = output<Inventory>();
  protected modalService = inject(ModalService);
  protected allowedInventories = computed(() => {
    // @todo : this is a security issue, should be handled server side.
    if (this.isManager()) {
      return this.inventories();
    }

    return this.inventories().filter(inv => !inv.def.isSecret);
  });

  protected isManager = this.currentSessionState.allowedToEditCharacter(this.character);

  protected onInventoryClick(inventory: Inventory) {
    this.modalService.open(InventoryViewDetailsComponent, { 
      character: this.character(),
      inventory });
  }
}
