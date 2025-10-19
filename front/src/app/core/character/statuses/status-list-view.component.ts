import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Status } from './status-control.component';
import { StatusViewComponent } from './status-view.component';

@Component({
  selector: 'app-status-list-view',
  template: `
    @for(status of selected(); track status.instance.id) {
      <app-status-view [status]="status"></app-status-view>
    }
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: row;
      gap: var(--gap-medium);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StatusViewComponent],
})
export class StatusListViewComponent {
  public statuses = input.required<Status[]>();
  public selected = computed(() => this.statuses().filter(s => s.selected));
}
