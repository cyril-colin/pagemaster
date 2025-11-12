import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { GameDef } from '@pagemaster/common/pagemaster.types';
import { CardComponent } from '../design-system/card.component';

@Component({
  selector: 'app-game-def-selector',
  template: `
    <ds-card>
      <div [formGroup]="form()" class="form-container">
        <div class="form-content">
          <h3 class="form-title">Choose Your Game System</h3>
          <p class="form-description">Select the tabletop RPG system you want to play</p>
          
          @let games = gameDefs();
          @if (games?.length) {
            <div class="select-wrapper">
              <label for="gameDef" class="select-label">Game System</label>
              <div class="select-container">
                <select [formControl]="form().controls.gameDef" id="gameDef" class="select-input">
                  <option value="" disabled>Select a game system</option>
                  @for (gameDef of games ; track gameDef.id) {
                    <option [value]="gameDef.id">{{ gameDef.name }}</option>
                  }
                </select>
              </div>
            </div>
          } @else { 
            <div class="empty-state">
              <p>No game systems available.</p>
              <p class="hint">Please contact your administrator to add game definitions.</p>
            </div>
          }
        </div>
        
        <div class="form-actions">
          <button 
            type="button" 
            class="submit-button"
            (click)="select()">
            Continue
          </button>
        </div>
      </div>
    </ds-card>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    ds-card {
      max-width: 600px;
      margin: 0 auto;
    }

    .form-container {
      display: flex;
      flex-direction: column;
      gap: var(--gap-large);
    }

    .form-content {
      display: flex;
      flex-direction: column;
      gap: var(--gap-medium);
    }

    .form-title {
      color: var(--text-primary);
      font-size: var(--text-size-xlarge);
      font-weight: var(--text-weight-bold);
      margin: 0;
    }

    .form-description {
      color: var(--text-secondary);
      font-size: var(--text-size-medium);
      margin: 0;
      line-height: 1.5;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--gap-medium);
      padding-top: var(--padding-small);
      border-top: 1px solid var(--color-border);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--gap-small);
      padding: var(--padding-large);
      text-align: center;
      background-color: var(--color-background-secondary);
      border-radius: var(--view-border-radius);
    }

    .empty-state p {
      color: var(--text-secondary);
      font-size: var(--text-size-medium);
      margin: 0;
    }

    .hint {
      color: var(--text-tertiary);
      font-size: var(--text-size-small);
      font-style: italic;
    }

    .select-wrapper {
      display: flex;
      flex-direction: column;
      gap: var(--gap-small);
      width: 100%;
    }

    .select-label {
      color: var(--text-primary);
      font-size: var(--text-size-medium);
      font-weight: var(--text-weight-medium);
      cursor: pointer;
    }

    .select-container {
      position: relative;
      width: 100%;
    }

    .select-container::after {
      content: '';
      position: absolute;
      right: 16px;
      top: 50%;
      transform: translateY(-50%);
      width: 0;
      height: 0;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: 6px solid var(--text-secondary);
      pointer-events: none;
    }

    .select-input {
      width: 100%;
      padding: var(--padding-medium);
      padding-right: 40px;
      border: var(--view-border);
      border-radius: var(--view-border-radius);
      background-color: var(--color-background-main);
      color: var(--text-primary);
      font-size: var(--text-size-medium);
      font-family: inherit;
      cursor: pointer;
      appearance: none;
      transition: all var(--transition-speed) ease;
    }

    .select-input:hover {
      border-color: var(--color-primary);
      background-color: var(--hover-bg);
    }

    .select-input:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
    }

    .select-input option {
      background-color: var(--color-background-main);
      color: var(--text-primary);
      padding: var(--padding-medium);
    }

    .submit-button {
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
      min-height: 40px;
      min-width: 120px;
      background-color: var(--color-primary);
      color: var(--color-text-on-primary);
    }

    .submit-button:hover {
      opacity: 0.9;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px var(--color-shadow);
    }

    .submit-button:active {
      transform: translateY(0);
    }

    .submit-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `],
  imports: [
    ReactiveFormsModule,
    CardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameDefSelectorComponent {
  public gameDefs = input.required<GameDef[]>();
  public selectedGameDef = output<GameDef>();
  private fb = inject(FormBuilder);
  protected form = computed(() => {
    const firstGame = this.gameDefs()[0];
    return this.fb.group({
      gameDef: [firstGame?.id || ''],
    });
  });

  protected select() {
    const selectedId = this.form().getRawValue().gameDef;
    if (this.form().valid && selectedId) {
      const gameDef = this.gameDefs().find(g => g.id === selectedId);
      if (gameDef) {
        this.selectedGameDef.emit(gameDef);
      }
    }
  }
}