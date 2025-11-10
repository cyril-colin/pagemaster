import { ChangeDetectionStrategy, Component, computed, HostListener, inject, input, output } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ICON_STORE, IconName } from './icon.store';

export type ButtonMode = 'primary' | 'secondary' | 'tertiary' | 'primary-danger' | 'secondary-danger';
export type ButtonState = 
  | { state: 'default' }
  | { state: 'loading' }
  | { state: 'error', message: string };

@Component({
  selector: 'ds-button',
  standalone: true,
  template: `
    <button 
      [class]="'button mode-' + mode() + ' state-' + state().state"
      [disabled]="state().state === 'loading' || state().state === 'error'"
      (click)="$event.preventDefault();"
      [attr.title]="getErrorMessage()"
    >
      @if (state().state === 'loading') {
        <span class="spinner"></span>
      }
      @if (icon() && state().state !== 'loading') {
        <span class="icon" [innerHTML]="iconSvg()"></span>
      }
      <span class="content">
        <ng-content></ng-content>
      </span>
      @if (getErrorMessage()) {
        <span class="error-message">{{ getErrorMessage() }}</span>
      }
    </button>
  `,
  styles: [`
    :host {
      display: contents;
    }

    .button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 16px;
      border-radius: 6px;
      font-size: var(--text-size-medium);
      font-weight: var(--text-weight-medium);
      border: 1px solid transparent;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      min-height: 40px;
    }

    .button:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }

    .content {
      display: inline-flex;
      align-items: center;
    }

    .content:empty {
      display: none;
    }

    .icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    .icon :deep(svg) {
      width: 100%;
      height: 100%;
      display: block;
      stroke: currentColor;
    }

    /* Modes */
    .mode-primary {
      background: var(--color-primary);
      color: var(--text-on-primary);
      border-color: var(--color-primary);
    }

    .mode-primary:hover:not(:disabled) {
      background: var(--color-primary-hover, var(--color-primary));
      filter: brightness(1.1);
    }

    .mode-primary:active:not(:disabled) {
      filter: brightness(0.9);
    }

    .mode-secondary {
      background: var(--color-background-secondary);
      color: var(--text-primary);
      border-color: var(--color-border);
    }

    .mode-secondary:hover:not(:disabled) {
      background: var(--color-background-tertiary);
      border-color: var(--color-primary);
    }

    .mode-secondary:active:not(:disabled) {
      background: var(--color-background-tertiary);
    }

    .mode-tertiary {
      background: transparent;
      color: var(--text-primary);
      border-color: transparent;
    }

    .mode-tertiary:hover:not(:disabled) {
      background: var(--color-background-secondary);
    }

    .mode-tertiary:active:not(:disabled) {
      background: var(--color-background-tertiary);
    }

    .mode-primary-danger {
      background: var(--color-danger);
      color: white;
      border-color: var(--color-danger);
    }

    .mode-primary-danger:hover:not(:disabled) {
      filter: brightness(1.1);
    }

    .mode-primary-danger:active:not(:disabled) {
      filter: brightness(0.9);
    }

    .mode-secondary-danger {
      background: var(--color-background-secondary);
      color: var(--color-danger);
      border-color: var(--color-danger);
    }

    .mode-secondary-danger:hover:not(:disabled) {
      background: var(--color-background-tertiary);
      border-color: var(--color-danger);
      filter: brightness(1.1);
    }

    .mode-secondary-danger:active:not(:disabled) {
      background: var(--color-background-tertiary);
      filter: brightness(0.9);
    }

    /* States */
    .state-loading .spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid currentColor;
      border-radius: 50%;
      border-top-color: transparent;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .state-error {
      border-color: var(--color-danger);
    }

    .state-error.mode-primary {
      background: var(--color-danger);
    }

    .error-message {
      position: absolute;
      bottom: -24px;
      left: 0;
      font-size: var(--text-size-small);
      color: var(--color-danger);
      white-space: nowrap;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  private sanitizer = inject(DomSanitizer);

  public mode = input<ButtonMode>('primary');
  public icon = input<IconName | null>(null);
  public state = input<ButtonState>({ state: 'default' });
  
  public click = output<MouseEvent>();

  @HostListener('click', ['$event'])
  protected disableClick(event: MouseEvent): void {
    event.preventDefault();
  }

  protected iconSvg = computed<SafeHtml>(() => {
    const iconName = this.icon();
    if (!iconName) return '';
    const svgString = ICON_STORE[iconName];
    return this.sanitizer.bypassSecurityTrustHtml(svgString);
  });

  protected getErrorMessage(): string | null {
    const currentState = this.state();
    return currentState.state === 'error' ? currentState.message : null;
  }
}
