import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AttributeStatus } from '@pagemaster/common/attributes.types';
import { ButtonComponent } from '../../design-system/button.component';
import { StatusViewComponent } from './status-view.component';

@Component({
  selector: 'app-status-list-view',
  template: `
    @for(status of statuses(); track status.id) {
      <app-status-view [status]="status" (click)="statusClicked.emit(status)"></app-status-view>
    }
    @if (statuses().length === 0) {
      <span class="empty-message">No status</span>
    }
    @if (showAddButton()) {
      <ds-button [mode]="'mini'" (click)="addStatusClicked.emit()" [icon]="'plus'" />
    }
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: row;
      gap: var(--gap-medium);
      flex-wrap: wrap;
      align-items: center;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StatusViewComponent, ButtonComponent],
})
export class StatusListViewComponent {
  public statuses = input.required<AttributeStatus[]>();
  public showAddButton = input<boolean>(false);
  public statusClicked = output<AttributeStatus>();
  public addStatusClicked = output<void>();
}
