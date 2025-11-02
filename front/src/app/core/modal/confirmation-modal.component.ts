import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonComponent } from '../design-system/button.component';

export type ConfirmationResult = 'confirmed' | 'aborted';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  template: `
    <div class="confirmation-modal">
      <div class="confirmation-content">
        <h3 class="confirmation-title">{{ title() }}</h3>
        <p class="confirmation-message">{{ message() }}</p>
      </div>
      <div class="confirmation-actions">
        <ds-button 
          mode="secondary" 
          (click)="result.emit('aborted')"
        >
          Cancel
        </ds-button>
        <ds-button 
          mode="primary-danger" 
          (click)="result.emit('confirmed')"
        >
          Confirm
        </ds-button>
      </div>
    </div>
  `,
  styles: [`
    .confirmation-modal {
      display: flex;
      flex-direction: column;
      gap: var(--gap-large);
      min-width: 400px;
      max-width: 500px;
    }

    .confirmation-content {
      display: flex;
      flex-direction: column;
      gap: var(--gap-medium);
    }

    .confirmation-title {
      margin: 0;
      color: var(--text-primary);
      font-size: var(--text-size-large);
      font-weight: var(--text-weight-bold);
    }

    .confirmation-message {
      margin: 0;
      color: var(--text-secondary);
      font-size: var(--text-size-medium);
      line-height: 1.5;
    }

    .confirmation-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--gap-small);
    }
  `],
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationModalComponent {
  public title = input<string>('Confirmation');
  public message = input.required<string>();
  public result = output<ConfirmationResult>();
}
