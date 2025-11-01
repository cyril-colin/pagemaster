import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ds-card',
  standalone: true,
  template: `
    <ng-content></ng-content>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--ds-card-gap);
      border: var(--ds-card-border);
      border-radius: var(--ds-card-border-radius);
      padding: var(--ds-card-padding);
      background: var(--ds-card-background);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {}