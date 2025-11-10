import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BadgeComponent } from '../../../design-system/badge.component';

@Component({
  selector: 'app-item-weight',
  template: `
    <ds-badge size="small">
      {{ weight() }}
    </ds-badge>
  `,
  styles: [`
    :host {
      position: absolute;
      bottom: 4px;
      right: 4px;
      z-index: 1;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [BadgeComponent],
})
export class ItemWeightComponent {
  public weight = input.required<number>();
}
