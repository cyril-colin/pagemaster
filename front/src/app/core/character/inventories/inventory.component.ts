import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Inventory } from './inventory.types';

@Component({
  selector: 'app-inventory',
  template: `
    @let inv = inventory();
    <div class="inventory-container">
      <span class="inventory-name">{{inv.def.name}}</span>

      @if (inv.def.capacity.type === 'state') {
        <span class="inventory-count">
          @if (inv.def.capacity.value === 'empty') {
            Empty
          } @else if (inv.def.capacity.value === 'partial') {
            Partially full
          } @else {
            Full
          }
        </span>
      } @else {
        <span class="inventory-count">{{inv.instance.current.length}} / {{inv.def.capacity.max}} items</span>
      }
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      min-width: 100px;
      width: fit-content;
    }
    
    .inventory-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      height: var(--view-height-medium);
      border: var(--view-border);
      border-radius: var(--view-border-radius);
      padding: 0 var(--gap-small);
      background: transparent;
      gap: var(--gap-medium);
    }
    
    .inventory-name {
      font-size: 12px;
      color: var(--text-primary);
      font-weight: 500;
    }
    
    .inventory-count {
      font-size: 12px;
      color: var(--text-primary);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryComponent {
  public inventory = input.required<Inventory>();
}
