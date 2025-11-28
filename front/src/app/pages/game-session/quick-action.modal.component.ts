import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { ButtonComponent } from 'src/app/core/design-system/button.component';

@Component({
  selector: 'app-quick-action-modal',
  standalone: true,
  template: `
    <div class="quick-action-grid">
      <ds-button (click)="d6.emit()">d6</ds-button>
      <ds-button (click)="d20.emit()">d20</ds-button>
    </div>
  `,
  styles: [`
    .quick-action-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      padding: 1.5rem;
      justify-items: center;
      align-items: center;
    }
    ds-button {
      width: 100%;
      min-width: 80px;
      max-width: 140px;
    }
  `],
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuickActionModalComponent {
  d6 = output<void>();
  d20 = output<void>();
}
