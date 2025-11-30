import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { ButtonComponent } from 'src/app/core/design-system/button.component';

@Component({
  selector: 'app-quick-action-modal',
  standalone: true,
  template: `
    <h2 class="title">Quick Actions</h2>
    <div class="quick-action-grid">
      <ds-button (click)="d6.emit()">d6</ds-button>
      <ds-button (click)="d20.emit()">d20</ds-button>
      <ds-button (click)="lootBox.emit()">LootBox</ds-button>
    </div>
    <div class="bottom">
      <ds-button [mode]="'tertiary'" (click)="cancel.emit()" [icon]="'empty'">Cancel</ds-button>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      justify-content: space-between;
    }
    .title {
      text-align: center;
      margin-top: 1rem;
    }
    .quick-action-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      padding: 1.5rem;
      justify-items: center;
      align-items: center;
    }
    .bottom {
      display: flex;
      justify-content: center;
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
  lootBox = output<void>();
  cancel = output<void>();
}
