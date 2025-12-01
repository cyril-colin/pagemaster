import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AttributeStatus } from '@pagemaster/common/attributes.types';
import { EventPlayerStatusAdd, EventPlayerStatusDelete, EventPlayerTypes } from '@pagemaster/common/events-player.types';
import { tap } from 'rxjs';
import { ButtonComponent } from '../../design-system/button.component';
import { ModalService } from '../../modal';
import { AbstractPlayerControl } from '../abstract-player-control';
import { StatusFormComponent } from './status-form.component';
import { StatusListViewComponent } from './status-list-view.component';

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
    @if (selection.length === 0 && permissions().statuses.add) {
      <div class="statuses-view">
        <span class="empty-message">No statuses selected.</span>
      </div>
    }

    @if (selection.length > 0) {
      <div class="statuses-view">
        <app-status-list-view 
          [statuses]="selection" 
          [showAddButton]="permissions().statuses.add"
          (statusClicked)="onStatusClick($event)"
          (addStatusClicked)="openNewStatusModal()">
        </app-status-list-view>
      </div>
    }

    @if (selection.length === 0 && permissions().statuses.add) { 
      <ds-button [mode]="'secondary'" (click)="openNewStatusModal()" [icon]="'plus'">New Status</ds-button>
    }
  `,
  styles: [
    `
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--gap-medium);
    }

    :host:empty {
      display: none;
    }

    .statuses-view {
      padding: var(--card-padding);
      background-color: var(--color-background-secondary);
      border: var(--view-border);
      border-radius: var(--view-border-radius);
      min-height: 60px;
      display: flex;
      align-items: center;
    }

    .empty-message {
      color: var(--text-tertiary);
      font-style: italic;
    }
    `,
  ],
  imports: [
    StatusListViewComponent,
    ButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusControlComponent extends AbstractPlayerControl {



  private modalService = inject(ModalService);

  protected selectedStatuses() {
    return this.player().attributes.status;
  }

  protected onStatusClick(status: AttributeStatus) {
    if (this.permissions().statuses.edit) {
      this.openEditStatusModal(status);
    }
  }

  protected openNewStatusModal() {
    const modalRef = this.modalService.open(StatusFormComponent);
    modalRef.componentRef.instance.newStatus.subscribe((status: AttributeStatus) => {
      this.addStatus(status).pipe(
        tap(() => void modalRef.close()),
      ).subscribe();
    });
  }

  protected openEditStatusModal(status: AttributeStatus) {
    const modalRef = this.modalService.open(StatusFormComponent, { 
      status,
      permissions: { delete: this.permissions().statuses.delete },
    });
    modalRef.componentRef.instance.newStatus.subscribe((updatedStatus: AttributeStatus) => {
      this.updateStatus(updatedStatus).pipe(
        tap(() => void modalRef.close()),
      ).subscribe();
    });
    modalRef.componentRef.instance.deleteStatus.subscribe((deletedStatus: AttributeStatus) => {
      this.deleteStatus(deletedStatus).pipe(
        tap(() => void modalRef.close()),
      ).subscribe();
    });
  }



  protected addStatus(status: AttributeStatus) {

    const command = this.prepareEvent(EventPlayerTypes.PLAYER_STATUS_ADD) as Omit<EventPlayerStatusAdd, 'id' | 'timestamp'>;
    command.newStatus = status;

    return this.gameEventRepository.postCommand(command);
  }

  protected updateStatus(status: AttributeStatus) {
    const command = this.prepareEvent(EventPlayerTypes.PLAYER_STATUS_EDIT) as Omit<EventPlayerStatusAdd, 'id' | 'timestamp'>;
    command.newStatus = status;

    return this.gameEventRepository.postCommand(command);
  }

  protected deleteStatus(status: AttributeStatus) {

    const command = this.prepareEvent(EventPlayerTypes.PLAYER_STATUS_DELETE) as Omit<EventPlayerStatusDelete, 'id' | 'timestamp'>;
    command.statusId = status.id;

    return this.gameEventRepository.postCommand(command);
  }
}
