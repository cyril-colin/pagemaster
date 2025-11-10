import { ChangeDetectionStrategy, Component } from '@angular/core';

export type DividerSpacing = 'none' | 'small' | 'medium' | 'large';

@Component({
  selector: 'ds-divider',
  standalone: true,
  template: `
    
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      border-bottom: 1px solid grey;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DividerComponent {
}
