import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Status } from './status-control.component';

@Component({
  selector: 'app-status-view',
  template: `
    @let s = status();
    <div class="status-container" [style.border-color]="s.definition.color">
      <span class="status-name">{{s.definition.name}}</span>
      <span class="status-value">{{s.instance.current}}</span>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      min-width: 70px;
      width: fit-content;
    }
    
    .status-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      height: var(--view-height-medium);
      border: var(--view-border);
      border-radius: var(--view-border-radius);
      padding: 0 var(--gap-small);
      background: transparent;
    }
    
    .status-name {
      font-size: var(--text-size-small);
      color: var(--text-primary);
      font-weight: var(--text-weight-bold);
    }
    
    .status-value {
      font-size: 12px;
      color: var(--text-primary);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusViewComponent {
  public status = input.required<Status>();
}
