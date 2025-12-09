import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AttributeStatus } from '@pagemaster/common/attributes.types';
import { BadgeComponent } from '../../design-system/badge.component';

@Component({
  selector: 'app-status-view',
  template: `
    @let s = status();
    <ds-badge 
      [size]="'small'" 
      [customColor]="'transparent'"
      [customBorderColor]="s.color"
    >
      <span class="status-name">{{s.name}}</span>
    </ds-badge>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BadgeComponent],
})
export class StatusViewComponent {
  public status = input.required<AttributeStatus>();
}
