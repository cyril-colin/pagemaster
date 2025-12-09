import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AttributeBar } from '@pagemaster/common/attributes.types';
import {
    EventPlayerBarAdd,
    EventPlayerBarDelete,
    EventPlayerBarEdit,
    EventPlayerBarPointAdd,
    EventPlayerBarPointRemove,
    EventPlayerTypes,
} from '@pagemaster/common/events-player.types';
import { forkJoin, tap } from 'rxjs';
import { BarComponent } from '../../design-system/bar.component';
import { ButtonComponent } from '../../design-system/button.component';
import { ModalService } from '../../modal';
import { AbstractPlayerControl } from '../abstract-player-control';
import { BarFormComponent } from './bar-form.component';
import { BarSelectorModalComponent } from './bar-selector-modal.component';

export type BarValueUpdateEvent = {newBar: AttributeBar, previousValue: AttributeBar};

@Component({
  selector: 'app-bars-control',
  template: `
    @if (player().attributes.bar.length === 0 && permissions().bars.add) {
      <div class="bars-view">
        <span class="empty-message">No bars configured.</span>
        <ds-button [mode]="'primary'" (click)="openNewBarModal()">Add Bars</ds-button>
      </div>
    }

    @for(bar of player().attributes.bar; track bar.id) {
      <div class="bar-item">
        <div class="bar-content">
          <ds-bar 
            [value]="bar.current" 
            [color]="bar.color" 
            [editable]="permissions().bars.edit"
            [min]="bar.min"
            [max]="bar.max"
            (newValue)="updateBarValue(bar, $event)"
          />
        </div>
        @if (permissions().bars.edit || permissions().bars.delete) {
          <div class="bar-actions">
            @if (permissions().bars.edit) {
              <ds-button [mode]="'mini'" [icon]="'edit'" (click)="openEditBarModal(bar)" />
            }
          </div>
        }
      </div>
    }
  `,
  styles: [
    `
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--gap-medium);
    }

    .bars-view {
      padding: var(--card-padding);
      background-color: var(--color-background-secondary);
      border: var(--view-border);
      border-radius: var(--view-border-radius);
      min-height: 60px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--gap-medium);
    }

    .empty-message {
      color: var(--text-tertiary);
      font-style: italic;
    }

    .bar-item {
      display: flex;
      gap: var(--gap-medium);
      align-items: center;
    }

    .bar-content {
      display: flex;
      flex-direction: column;
      gap: var(--gap-small);
      flex: 1;
    }

    .bar-actions {
      display: flex;
      gap: var(--gap-small);
    }
    `,
  ],
  imports: [
    BarComponent,
    ButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarsControlComponent extends AbstractPlayerControl {


  private modalService = inject(ModalService);



  protected openNewBarModal() {
    const quickBars = this.gameSession().quickValues?.bars || [];
    const alreadyAddedIds = this.player().attributes.bar.map(b => b.id);

    const modalRef = this.modalService.open(BarSelectorModalComponent, {
      availableBars: quickBars,
      alreadyAddedBarIds: alreadyAddedIds,
    });

    modalRef.componentRef.instance.barsSelected.subscribe((newBars: AttributeBar[]) => {
      // Replace all bars: remove old ones, add new ones
      const barsToRemove = alreadyAddedIds.filter(id => !newBars.find(b => b.id === id));
      const barsToAdd = newBars.filter(b => !alreadyAddedIds.includes(b.id));
      
      const requests = [];
      
      // Add bulk delete request if there are bars to remove
      if (barsToRemove.length > 0) {
        requests.push(this.deleteBars(barsToRemove));
      }
      
      // Add bulk add request if there are bars to add
      if (barsToAdd.length > 0) {
        requests.push(this.addBars(barsToAdd));
      }
      
      if (requests.length > 0) {
        forkJoin(requests).pipe(
          tap(() => void modalRef.close()),
        ).subscribe();
      } else {
        void modalRef.close();
      }
    });
  }

  protected openEditBarModal(bar: AttributeBar) {
    this.modalService.open(BarFormComponent, {
      bar,
      gameSession: this.gameSession(),
      player: this.player(),
      permissions: this.permissions(),
    });
  }


  protected updateBarValue(bar: AttributeBar, values: {previous: number, newValue: number}): void {

    if (values.previous === values.newValue) {
      return; // No change in value, do not send event
    }

    if (values.newValue > values.previous) {
      const addedValue = values.newValue - values.previous;
      this.addPointToBar(bar.id, addedValue);
    } else {
      const removedValue = values.previous - values.newValue;
      this.removePointFromBar(bar.id, removedValue);
    }
  }

  protected addPointToBar(barId: string, addedValue: number): void {
    const command = this.prepareEvent(EventPlayerTypes.PLAYER_BAR_POINT_ADD) as Omit<EventPlayerBarPointAdd, 'id' | 'timestamp'>;
    command.barId = barId;
    command.addedValue = addedValue;

    this.gameEventRepository.postCommand(command).subscribe();
  }

  protected removePointFromBar(barId: string, removedValue: number): void {
    const command = this.prepareEvent(EventPlayerTypes.PLAYER_BAR_POINT_REMOVE) as Omit<EventPlayerBarPointRemove, 'id' | 'timestamp'>;
    command.barId = barId;
    command.removedValue = removedValue;

    this.gameEventRepository.postCommand(command).subscribe();
  }
  protected addBars(bars: AttributeBar[]) {
    const command = this.prepareEvent(EventPlayerTypes.PLAYER_BAR_ADD) as Omit<EventPlayerBarAdd, 'id' | 'timestamp'>;
    command.newBars = bars;

    return this.gameEventRepository.postCommand(command);
  }

  protected deleteBars(barIds: string[]) {
    const command = this.prepareEvent(EventPlayerTypes.PLAYER_BAR_DELETE) as Omit<EventPlayerBarDelete, 'id' | 'timestamp'>;
    command.barIds = barIds;

    return this.gameEventRepository.postCommand(command);
  }

  protected updateBar(bar: AttributeBar): void {
    const command = this.prepareEvent(EventPlayerTypes.PLAYER_BAR_EDIT) as Omit<EventPlayerBarEdit, 'id' | 'timestamp'>;
    command.newBar = bar;
    this.gameEventRepository.postCommand(command).subscribe();
  }
  
}