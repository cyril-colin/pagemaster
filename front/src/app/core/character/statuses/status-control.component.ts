import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { AttributeStatus } from '@pagemaster/common/attributes.types';
import { ButtonComponent } from '../../design-system/button.component';
import { ModalService } from '../../modal';
import { StatusFormComponent } from './status-form.component';
import { StatusListViewComponent } from './status-list-view.component';

// Type for the full status object with instance and selection state
export type Status = {
  definition: AttributeStatus,
  instance: { id: string, current: string },
  selected: boolean,
};

export type StatusesPermissions = {
  edit: boolean,
  add: boolean,
  delete: boolean,
};

@Component({
  selector: 'app-status-control',
  template: ` 
    @let selection = selectedStatuses();
    @if (selection.length === 0 && permissions().add) {
      <div class="statuses-view">
        <span class="empty-message">No statuses selected.</span>
      </div>
    }

    @if (selection.length > 0) {
      <div class="statuses-view">
        <app-status-list-view 
          [statuses]="selection" 
          [showAddButton]="permissions().add"
          (statusClicked)="onStatusClick($event)"
          (addStatusClicked)="openNewStatusModal()">
        </app-status-list-view>
      </div>
    }

    @if (selection.length === 0 && permissions().add) { 
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
export class StatusControlComponent {
  public statuses = input.required<AttributeStatus[]>();
  public permissions = input.required<StatusesPermissions>();
  public newStatus = output<AttributeStatus>();
  public editStatus = output<AttributeStatus>();
  public deleteStatus = output<AttributeStatus>();

  private modalService = inject(ModalService);

  protected selectedStatuses() {
    return this.statuses();
  }

  protected onStatusClick(status: AttributeStatus) {
    if (this.permissions().edit) {
      this.openEditStatusModal(status);
    }
  }

  protected openNewStatusModal() {
    const modalRef = this.modalService.open(StatusFormComponent);
    modalRef.componentRef.instance.newStatus.subscribe((status: AttributeStatus) => {
      this.newStatus.emit(status);
      void modalRef.close();
    });
  }

  protected openEditStatusModal(status: AttributeStatus) {
    const modalRef = this.modalService.open(StatusFormComponent, { 
      status,
      permissions: { delete: this.permissions().delete },
    });
    modalRef.componentRef.instance.newStatus.subscribe((updatedStatus: AttributeStatus) => {
      this.editStatus.emit(updatedStatus);
      void modalRef.close();
    });
    modalRef.componentRef.instance.deleteStatus.subscribe((deletedStatus: AttributeStatus) => {
      this.deleteStatus.emit(deletedStatus);
      void modalRef.close();
    });
  }
}
