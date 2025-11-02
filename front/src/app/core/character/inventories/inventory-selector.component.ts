import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { ButtonComponent } from '../../design-system/button.component';
import { ModalService } from '../../modal';
import { InventorySelectionEvent } from './inventory-list.component';
import { Inventory } from './inventory.types';



@Component({
  selector: 'app-inventory-selector-button',
  template: `
  <ds-button [mode]="'secondary'" [icon]="'plus'" (click)="onManageInventories()">Manage Inventories</ds-button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent],
})
export class InventorySelectorButtonComponent {
  public inventories = input.required<Inventory[]>();
  public select = output<InventorySelectionEvent>();
  public unselect = output<InventorySelectionEvent>();
  private modalService = inject(ModalService);

  protected onManageInventories() {
    const modalRef = this.modalService.open(InventorySelectorComponent, {inventories: this.inventories()});
    modalRef.componentRef.instance.select.subscribe((inventory: Inventory) => {
      this.select.emit({ type: 'select', inventory, modalRef });
    });
    modalRef.componentRef.instance.unselect.subscribe((inventory: Inventory) => {
      this.unselect.emit({ type: 'unselect', inventory, modalRef });
    });
  }
}


@Component({
  selector: 'app-inventory-selector',
  template: `
    <div class="inventory-selector">
      @for(inventory of inventories(); track inventory.def.id) {
        <div class="inventory-item">
          <input 
            type="checkbox" 
            [checked]="inventory.selected" 
            [value]="inventory.def.id" 
            (change)="onSelectionChange($event, inventory)" 
          />
          {{ inventory.def.name }}
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventorySelectorComponent {
  public inventories = input.required<Inventory[]>();
  public select = output<Inventory>();
  public unselect = output<Inventory>();

  protected onSelectionChange(event: Event, inventory: Inventory) {
    const inputElement = event.target as HTMLInputElement;

    if (inputElement.checked) {
      this.select.emit(inventory);
    } else {
      this.unselect.emit(inventory);
    }
  }
}
