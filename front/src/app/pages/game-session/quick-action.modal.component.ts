import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { ButtonComponent } from 'src/app/core/design-system/button.component';

@Component({
  selector: 'app-quick-action-modal',
  standalone: true,
  template: `
    <div class="modal-header">
      <h2 class="title">⚡ Quick Actions</h2>
      <p class="subtitle">Choose your action</p>
    </div>
    
    <div class="quick-action-grid">
      <button class="action-card dice-card" (click)="d6.emit()">
        <div class="card-icon">🎲</div>
        <div class="card-label">Roll d6</div>
        <div class="card-description">Six-sided die</div>
      </button>
      
      <button class="action-card dice-card" (click)="d20.emit()">
        <div class="card-icon">🎯</div>
        <div class="card-label">Roll d20</div>
        <div class="card-description">Twenty-sided die</div>
      </button>
      
      <button class="action-card loot-card" (click)="lootBox.emit()">
        <div class="card-icon">📦</div>
        <div class="card-label">Loot Box</div>
        <div class="card-description">Open treasure</div>
      </button>
    </div>
    
    <div class="bottom">
      <ds-button [mode]="'tertiary'" (click)="cancel.emit()" [icon]="'close'">Cancel</ds-button>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      justify-content: space-between;
      padding: 1.5rem;
      gap: 1.5rem;
    }
    
    .modal-header {
      text-align: center;
    }
    
    .title {
      margin: 0 0 0.5rem 0;
      font-size: 1.75rem;
      font-weight: 700;
      background: linear-gradient(135deg, var(--color-primary) 0%, #ff8c42 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .subtitle {
      margin: 0;
      color: var(--text-secondary);
      font-size: 0.95rem;
      font-weight: 500;
    }
    
    .quick-action-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      flex: 1;
      align-content: start;
    }
    
    .action-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1.5rem 1rem;
      background: var(--color-background-secondary);
      border: 2px solid var(--color-border);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      min-height: 140px;
    }
    
    .action-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, transparent 0%, rgba(212, 128, 79, 0.1) 100%);
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    .action-card:hover {
      transform: translateY(-4px) scale(1.02);
      border-color: var(--color-primary);
      box-shadow: 0 8px 24px rgba(212, 128, 79, 0.25);
    }
    
    .action-card:hover::before {
      opacity: 1;
    }
    
    .action-card:active {
      transform: translateY(-2px) scale(1);
    }
    
    .dice-card:hover {
      border-color: #4d94ff;
      box-shadow: 0 8px 24px rgba(77, 148, 255, 0.25);
    }
    
    .dice-card:hover::before {
      background: linear-gradient(135deg, transparent 0%, rgba(77, 148, 255, 0.1) 100%);
    }
    
    .loot-card {
      grid-column: 1 / -1;
    }
    
    .loot-card:hover {
      border-color: #ffd700;
      box-shadow: 0 8px 24px rgba(255, 215, 0, 0.25);
    }
    
    .loot-card:hover::before {
      background: linear-gradient(135deg, transparent 0%, rgba(255, 215, 0, 0.1) 100%);
    }
    
    .card-icon {
      font-size: 2.5rem;
      margin-bottom: 0.75rem;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
      transition: transform 0.3s ease;
    }
    
    .action-card:hover .card-icon {
      transform: scale(1.15) rotate(5deg);
    }
    
    .card-label {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.25rem;
      position: relative;
      z-index: 1;
    }
    
    .card-description {
      font-size: 0.85rem;
      color: var(--text-secondary);
      position: relative;
      z-index: 1;
    }
    
    .bottom {
      display: flex;
      justify-content: center;
      padding-top: 1rem;
      border-top: 1px solid var(--color-border);
    }
    
    ds-button {
      min-width: 120px;
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
