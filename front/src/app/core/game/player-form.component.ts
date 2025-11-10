import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, OnInit, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { tap } from 'rxjs';

export interface PlayerFormValue {
  name: string,
  position: number,
  characterName: string,
}

interface PlayerItem {
  name: FormControl<string>,
  position: FormControl<number>,
  characterName: FormControl<string>,
}

@Component({
  selector: 'app-player-form',
  template: `
    <div class="player-form">
      <div class="form-field">
        <label [for]="'name-' + index()">Player Name</label>
        <input [id]="'name-' + index()" [formControl]="form.controls.name" type="text" />
      </div>

      <div class="form-field">
        <label [for]="'characterName-' + index()">Character Name</label>
        <input [id]="'characterName-' + index()" [formControl]="form.controls.characterName" type="text" />
      </div>
      
      <div class="form-field">
        <label [for]="'characterPosition-' + index()">Character Position</label>
        <input [id]="'characterPosition-' + index()" [formControl]="form.controls.position" type="number" />
      </div>
    </div>
  `,
  styles: [`
    .player-form {
      display: flex;
      flex-direction: column;
      gap: var(--gap-medium);
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: var(--gap-small);
    }

    .form-field label {
      font-size: var(--text-size-small);
      font-weight: var(--text-weight-medium);
      color: var(--text-secondary);
    }

    .form-field input {
      padding: var(--padding-small);
      background-color: var(--color-background-tertiary);
      border: var(--view-border);
      border-radius: var(--view-border-radius);
      color: var(--text-primary);
      font-size: var(--text-size-medium);
      transition: border-color var(--transition-speed), box-shadow var(--transition-speed);
    }

    .form-field input:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 2px rgba(212, 128, 79, 0.2);
    }

    .form-field input:invalid {
      border-color: var(--color-danger);
    }

    .form-field input:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `],
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerFormComponent implements OnInit {
  public index = input<number>(0);
  public player = input<PlayerFormValue | undefined>();
  public playerChange = output<PlayerFormValue>();
  
  private readonly destroyRef = inject(DestroyRef);
  
  protected form: FormGroup<PlayerItem> = new FormGroup<PlayerItem>({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    position: new FormControl(0, { nonNullable: true }),
    characterName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  constructor() {
    effect(() => {
      const playerValue = this.player();
      if (playerValue) {
        this.form.setValue(playerValue, { emitEvent: false });
      }
    });
  }

  ngOnInit() {
    this.form.valueChanges
      .pipe(
        tap((value) => {
          this.playerChange.emit(value as PlayerFormValue);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }
}
