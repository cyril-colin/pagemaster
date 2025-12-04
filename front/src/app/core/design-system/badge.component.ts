import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ICON_STORE, IconName } from './icon.store';

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
      @if (rightIcon()) {
        <span class="icon" [innerHTML]="rightIconSvg()"></span>
      }
    </div>
  `,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      font-weight: var(--text-weight-medium);
      border-radius: 4px;
      border: 1px solid transparent;
      white-space: nowrap;
      text-transform: capitalize;
    }

    .icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .icon :deep(svg) {
      display: block;
      stroke: currentColor;
    }

    /* Sizes */
    .size-small {
      font-size: var(--text-size-small);
      padding: 2px 6px;
    }

    .size-small .icon {
      width: 12px;
      height: 12px;
    }

    .size-medium {
      font-size: var(--text-size-medium);
      padding: 4px 8px;
    }

    .size-medium .icon {
      width: 14px;
      height: 14px;
    }

    .size-large {
      font-size: var(--text-size-large);
      padding: 6px 12px;
    }

    .size-large .icon {
      width: 16px;
      height: 16px;
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
  private sanitizer = inject(DomSanitizer);

  public size = input<BadgeSize>('medium');
  public variant = input<BadgeVariant>('default');
  public customColor = input<string | null>(null);
  public customBorderColor = input<string | null>(null);
  public rightIcon = input<IconName | null>(null);

  protected rightIconSvg = computed<SafeHtml>(() => {
    const iconName = this.rightIcon();
    if (!iconName) return '';
    const svgString = ICON_STORE[iconName];
    return this.sanitizer.bypassSecurityTrustHtml(svgString);
  });
}
