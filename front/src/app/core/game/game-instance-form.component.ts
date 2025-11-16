import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { GameInstance } from '@pagemaster/common/pagemaster.types';
import { CardComponent } from '../design-system/card.component';

interface GameFormType {
  masterName: FormControl<string>,
}

@Component({
  selector: 'app-game-instance-form',
  template: `
    <ds-card>
      <div [formGroup]="form" class="form-container">
        <div class="form-content">
          <h3 class="form-title">Setup Your Game Master</h3>
          <p class="form-description">
            Create your Game Master profile for the new session
          </p>
          
          <div class="input-wrapper">
            <label for="masterName" class="input-label">
              Game Master Name
              <span class="required-marker">*</span>
            </label>
            <div class="input-container">
              <input 
                id="masterName" 
                [formControl]="form.controls.masterName" 
                type="text"
                placeholder="Enter your name"
                class="input-field"
                [class.error]="form.controls.masterName.invalid && form.controls.masterName.touched"
              />
            </div>
            <span class="input-hint">This name will be visible to all players in the game</span>
          </div>
        </div>
        
        <div class="form-actions">
          <button 
            type="button" 
            class="submit-button"
            (click)="submit()">
            Create Game Instance
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

    .form-description strong {
      color: var(--color-primary);
      font-weight: var(--text-weight-bold);
    }

    .input-wrapper {
      display: flex;
      flex-direction: column;
      gap: var(--gap-small);
      width: 100%;
    }

    .input-label {
      color: var(--text-primary);
      font-size: var(--text-size-medium);
      font-weight: var(--text-weight-medium);
      cursor: pointer;
    }

    .required-marker {
      color: var(--color-error, #ef4444);
      margin-left: 2px;
    }

    .input-container {
      position: relative;
      width: 100%;
    }

    .input-field {
      width: 100%;
      padding: var(--padding-medium);
      border: var(--view-border);
      border-radius: var(--view-border-radius);
      background-color: var(--color-background-main);
      color: var(--text-primary);
      font-size: var(--text-size-medium);
      font-family: inherit;
      transition: all var(--transition-speed) ease;
    }

    .input-field:hover {
      border-color: var(--color-primary);
      background-color: var(--hover-bg);
    }

    .input-field:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
    }

    .input-field::placeholder {
      color: var(--text-tertiary);
    }

    .input-field.error {
      border-color: var(--color-error, #ef4444);
    }

    .input-hint {
      color: var(--text-secondary);
      font-size: var(--text-size-small);
      font-style: italic;
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
      min-width: 180px;
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

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--gap-medium);
      padding-top: var(--padding-small);
      border-top: 1px solid var(--color-border);
    }
  `],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameInstanceFormComponent {
  public newGameInstance = output<GameInstance>();
  private fb = inject(FormBuilder);
  
  protected form = this.fb.group<GameFormType>({
    masterName: this.fb.control('', { nonNullable: true, validators: [Validators.required]}),
  });

  protected submit() {
    const gameInstanceForm = this.form.getRawValue();
    if (this.form.valid && gameInstanceForm) {
      const gameInstance: GameInstance = {
        id: `session-${gameInstanceForm.masterName}-${Date.now()}`,
        version: 0,
        participants: [
          {
            id: `gamemaster-${gameInstanceForm.masterName}`,
            type: 'gameMaster',
            name: gameInstanceForm.masterName.replaceAll(' ', '-'),
          },
        ],
      };

      this.newGameInstance.emit(gameInstance);
    }
  }
}