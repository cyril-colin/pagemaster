import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type BadgeSize = 'small' | 'medium' | 'large';
export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

@Component({
  selector: 'ds-badge',
  template: `
    <div 
      [class]="'badge size-' + size() + ' variant-' + variant()"
      [style.background-color]="customColor() || null"
      [style.border-color]="customBorderColor() || null"
    >
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    :host {
      display: contents;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: var(--text-weight-medium);
      border-radius: 4px;
      border: 1px solid transparent;
      white-space: nowrap;
      text-transform: capitalize;
    }

    /* Sizes */
    .size-small {
      font-size: var(--text-size-small);
      padding: 2px 6px;
    }

    .size-medium {
      font-size: var(--text-size-medium);
      padding: 4px 8px;
    }

    .size-large {
      font-size: var(--text-size-large);
      padding: 6px 12px;
    }

    /* Variants */
    .variant-default {
      background: var(--color-background-tertiary);
      color: var(--text-primary);
      border-color: var(--color-border);
    }

    .variant-primary {
      background: var(--color-primary);
      color: var(--text-on-primary);
      border-color: var(--color-primary);
    }

    .variant-secondary {
      background: var(--color-secondary);
      color: var(--text-on-primary);
      border-color: var(--color-secondary);
    }

    .variant-success {
      background: var(--color-success);
      color: var(--text-on-primary);
      border-color: var(--color-success);
    }

    .variant-warning {
      background: var(--color-warning);
      color: var(--text-primary);
      border-color: var(--color-warning);
    }

    .variant-danger {
      background: var(--color-danger);
      color: var(--text-on-primary);
      border-color: var(--color-danger);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class BadgeComponent {
  public size = input<BadgeSize>('medium');
  public variant = input<BadgeVariant>('default');
  public customColor = input<string | null>(null);
  public customBorderColor = input<string | null>(null);
}
