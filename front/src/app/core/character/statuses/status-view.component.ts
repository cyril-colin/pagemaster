import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BadgeComponent } from '../../design-system/badge.component';
import { Status } from './status-control.component';

@Component({
  selector: 'app-status-view',
  template: `
    @let s = status();
    <ds-badge 
      size="medium" 
      [customColor]="'transparent'"
      [customBorderColor]="s.definition.color"
    >
      <span class="status-name">{{s.definition.name}}</span>
      <span class="status-value">{{s.instance.current}}</span>
    </ds-badge>
  `,
  styles: [`
    :host {
      display: flex;
      min-width: 70px;
      width: fit-content;
    }
    
    ds-badge {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      min-height: var(--view-height-medium);
      gap: var(--gap-small);
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
  imports: [BadgeComponent],
})
export class StatusViewComponent {
  public status = input.required<Status>();
}
