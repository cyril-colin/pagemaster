import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AttributeInventory } from '@pagemaster/common/attributes.types';
import { EventPlayerInventoryAdd, EventPlayerTypes } from '@pagemaster/common/events-player.types';
import { CurrentParticipantState } from '../../current-participant.state';
import { ModalRef, ModalService } from '../../modal';
import { AbstractPlayerControl } from '../abstract-player-control';
import { InventoryFormComponent } from './inventory-form.component';
import { InventoryAdderButtonComponent } from './inventory-selector.component';
import {
  InventoryComponent,
} from './inventory.component';

export type InventoryAdditionEvent = {
  inventory: AttributeInventory,
  modalRef: ModalRef<InventoryFormComponent>,
};


@Component({
  selector: 'app-inventory-list',
  template: `
    <div class="inventory-list">
      <div class="inventory-list__header">
        @if(permissions().inventory.add) {
          <app-inventory-adder-button (addInventory)="addInventory($event)" />
        }

        <div class="inventory-tabs">
          @for(inventory of allowedInventories(); track inventory.id) {
            <button
              type="button"
              class="tab-button" 
              [class.active]="inventory.id === selectedInventory().id"
              (click)="selectInventory(inventory.id)"
            >
              {{ inventory.name || 'Inventory' }}
            </button>
          }
        </div>
      </div>

      <div class="inventory-list__content">
        @if(selectedInventory()) {
          <div class="inventory-panel">
            <app-inventory
              [inventory]="selectedInventory()"
              [gameSession]="gameSession()"
              [player]="player()"
              [permissions]="permissions()"
            />
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
    .inventory-list__header { display: flex; align-items: center; gap: 12px; }
    .inventory-tabs { display: flex; gap: 8px; margin-left: 8px; }
    .tab-button { background: transparent; border: none; padding: 8px 12px; cursor: pointer; border-radius: 6px; color: var(--pm-text); }
    .tab-button.active { background: rgba(0,0,0,0.06); box-shadow: 0 1px 0 rgba(0,0,0,0.04) inset; }

    .inventory-list__content { margin-top: 12px; }
    .inventory-panel { animation: tabSwitch 260ms cubic-bezier(.2,.9,.2,1); }

    @keyframes tabSwitch {
      from { opacity: 0; transform: translateY(6px) scale(0.995); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    InventoryComponent,
    InventoryAdderButtonComponent,
  ],
})
export class InventoryListComponent extends AbstractPlayerControl {


  private currentParticipant = inject(CurrentParticipantState);
  protected modalService = inject(ModalService);

  protected allowedInventories = computed(() => {
    // @todo : this is a security issue, should be handled server side.
    if (this.isManager()) {
      return this.player().attributes.inventory;
    }

    return this.player().attributes.inventory.filter(inv => !inv.isSecret);
  });

  protected isManager = this.currentParticipant.allowedToEditPlayer();

  // selected inventory id (mutable)
  protected selectedInventoryId = signal<string | null>(null);

  // the currently selected inventory object; falls back to first allowed inventory
  protected selectedInventory = computed(() => {
    const list = this.allowedInventories();
    if (!list || list.length === 0) return null as unknown as AttributeInventory;
    const id = this.selectedInventoryId();
    return list.find(inv => inv.id === id) ?? list[0];
  });

  protected selectInventory(id: string) {
    this.selectedInventoryId.set(id);
  }


  protected addInventory(event: InventoryAdditionEvent) {
    const command = this.prepareEvent(EventPlayerTypes.PLAYER_INVENTORY_ADD) as Omit<EventPlayerInventoryAdd, 'id' | 'timestamp'>;
    command.newInventory = event.inventory;

    return this.gameEventRepository.postCommand(command);
  }

}
