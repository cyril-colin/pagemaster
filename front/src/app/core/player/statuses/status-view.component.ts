import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AttributeStatus } from '@pagemaster/common/attributes.types';
import { BadgeComponent } from '../../design-system/badge.component';

@Component({
  selector: 'app-status-view',
  template: `
    @let s = status();
    <ds-badge 
      size="medium" 
      [customColor]="'transparent'"
      [customBorderColor]="s.color"
    >
      <span class="status-name">{{s.name}}</span>
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
      width: 100%;
      min-height: var(--view-height-medium);
    }
    
    .status-name {
      font-size: var(--text-size-small);
      color: var(--text-primary);
      font-weight: var(--text-weight-bold);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BadgeComponent],
})
export class StatusViewComponent {
  public status = input.required<AttributeStatus>();
}
