import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { AttributeInventory } from '@pagemaster/common/attributes.types';
import { ButtonComponent } from '../../design-system/button.component';
import { ModalService } from '../../modal';
import { InventoryFormComponent } from './inventory-form.component';
import { InventoryAdditionEvent } from './inventory-list.component';



@Component({
  selector: 'app-inventory-adder-button',
  template: `
  <ds-button [mode]="'secondary'" [icon]="'plus'" (click)="onAddInventory()">Add Inventory</ds-button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent],
})
export class InventoryAdderButtonComponent {
  public addInventory = output<InventoryAdditionEvent>();
  private modalService = inject(ModalService);

  protected onAddInventory() {
    const modalRef = this.modalService.open(InventoryFormComponent, {});
    modalRef.componentRef.instance.newInventory.subscribe((inventory: AttributeInventory) => {
      this.addInventory.emit({ inventory, modalRef });
    });
  }
}
