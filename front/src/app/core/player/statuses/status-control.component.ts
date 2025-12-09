import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AttributeStatus } from '@pagemaster/common/attributes.types';
import { EventPlayerStatusAdd, EventPlayerStatusDelete, EventPlayerTypes } from '@pagemaster/common/events-player.types';
import { forkJoin, tap } from 'rxjs';
import { ModalService } from '../../modal';
import { AbstractPlayerControl } from '../abstract-player-control';
import { StatusListViewComponent } from './status-list-view.component';
import { StatusSelectorModalComponent } from './status-selector-modal.component';

// Type for the full status object with instance and selection state
export type Status = {
  definition: AttributeStatus,
  instance: { id: string, current: string },
  selected: boolean,
};

@Component({
  selector: 'app-status-control',
  template: ` 
    @let selection = selectedStatuses();
    <app-status-list-view 
      [statuses]="selection" 
      [showAddButton]="permissions().statuses.add"
      (click)="openNewStatusModal()"
    >
    </app-status-list-view>
  `,
  styles: [
    `
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--gap-medium);
    }
    `,
  ],
  imports: [
    StatusListViewComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusControlComponent extends AbstractPlayerControl {



  private modalService = inject(ModalService);

  protected selectedStatuses() {
    return this.player().attributes.status;
  }

  protected openNewStatusModal() {
    const quickStatuses = this.gameSession().quickValues?.statuses || [];
    const alreadyAddedIds = this.player().attributes.status.map(s => s.id);

    const modalRef = this.modalService.open(StatusSelectorModalComponent, {
      availableStatuses: quickStatuses,
      alreadyAddedStatusIds: alreadyAddedIds,
    });

    modalRef.componentRef.instance.statusesSelected.subscribe((newStatuses: AttributeStatus[]) => {
      // Replace all statuses: remove old ones, add new ones
      const statusesToRemove = alreadyAddedIds.filter(id => !newStatuses.find(s => s.id === id));
      const statusesToAdd = newStatuses.filter(s => !alreadyAddedIds.includes(s.id));
      
      const requests = [];
      
      // Add bulk delete request if there are statuses to remove
      if (statusesToRemove.length > 0) {
        requests.push(this.deleteStatuses(statusesToRemove));
      }
      
      // Add bulk add request if there are statuses to add
      if (statusesToAdd.length > 0) {
        requests.push(this.addStatuses(statusesToAdd));
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

  protected addStatuses(statuses: AttributeStatus[]) {
    const command = this.prepareEvent(EventPlayerTypes.PLAYER_STATUS_ADD) as Omit<EventPlayerStatusAdd, 'id' | 'timestamp'>;
    command.newStatuses = statuses;

    return this.gameEventRepository.postCommand(command);
  }

  protected deleteStatuses(statusIds: string[]) {
    const command = this.prepareEvent(EventPlayerTypes.PLAYER_STATUS_DELETE) as Omit<EventPlayerStatusDelete, 'id' | 'timestamp'>;
    command.statusIds = statusIds;

    return this.gameEventRepository.postCommand(command);
  }
}
