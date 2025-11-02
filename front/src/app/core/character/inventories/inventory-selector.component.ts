import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { ButtonComponent } from '../../design-system/button.component';
import { ModalService } from '../../modal';
import { InventoryAdditionEvent } from './inventory-list.component';
import { Inventory } from './inventory.types';



@Component({
  selector: 'app-inventory-adder-button',
  template: `
  <ds-button [mode]="'secondary'" [icon]="'plus'" (click)="onAddInventory()">Add Inventory</ds-button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent],
})
export class InventoryAdderButtonComponent {
  public inventories = input.required<Inventory[]>();
  public addInventory = output<InventoryAdditionEvent>();
  private modalService = inject(ModalService);

  protected onAddInventory() {
    const modalRef = this.modalService.open(InventoryAdderComponent, {inventories: this.inventories()});
    modalRef.componentRef.instance.add.subscribe((inventory: Inventory) => {
      this.addInventory.emit({ inventory, modalRef });
    });
  }
}


@Component({
  selector: 'app-inventory-adder',
  template: `
    <div class="inventory-adder">
      <h3>Add Inventory</h3>
      <div class="inventory-list">
        @for(inventory of availableInventories(); track inventory.def.id) {
          <div class="inventory-item">
            <div class="inventory-info">
              <strong>{{ inventory.def.name }}</strong>
              @if(inventory.def.isSecret) {
                <span class="secret-badge">Secret</span>
              }
            </div>
            <ds-button 
              [mode]="'primary'" 
              [icon]="'plus'"
              (click)="onAdd(inventory)"
            >
              Add
            </ds-button>
          </div>
        }
        @if(availableInventories().length === 0) {
          <p class="no-inventories">All available inventories have been added.</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .inventory-adder {
      display: flex;
      flex-direction: column;
      gap: var(--gap-medium);
      min-width: 400px;
      max-width: 600px;
    }

    h3 {
      margin: 0;
      color: var(--text-primary);
      font-size: var(--text-size-large);
      font-weight: var(--text-weight-bold);
    }

    .inventory-list {
      display: flex;
      flex-direction: column;
      gap: var(--gap-small);
    }

    .inventory-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--gap-medium);
      background: var(--color-background-secondary);
      border-radius: 6px;
      gap: var(--gap-medium);
    }

    .inventory-info {
      display: flex;
      flex-direction: column;
      gap: var(--gap-small);
    }

    .secret-badge {
      font-size: var(--text-size-small);
      color: var(--text-secondary);
      font-style: italic;
    }

    .no-inventories {
      text-align: center;
      color: var(--text-secondary);
      padding: var(--gap-large);
      margin: 0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent],
})
export class InventoryAdderComponent {
  public inventories = input.required<Inventory[]>();
  public add = output<Inventory>();

  protected availableInventories = () => {
    // Filter out inventories that are already added (have instance.id)
    return this.inventories().filter(inv => !inv.instance.id);
  };

  protected onAdd(inventory: Inventory) {
    this.add.emit(inventory);
  }
}
