import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { GameDef, GameInstance } from '@pagemaster/common/pagemaster.types';

interface GameFormType {
  masterName: FormControl<string>,
}

@Component({
  selector: 'app-game-instance-form',
  template: `
    <h2>Setup your game master for the {{ gameDef().name }} session !</h2>
    <form [formGroup]="form" (ngSubmit)="submit()">
      <label for="masterName">Game Master Name</label>
      <input id="masterName" [formControl]="form.controls.masterName" type="text" />
      <button type="submit" [disabled]="form.invalid">Create Game Instance</button>
    </form>
  `,
  styles: [''],
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameInstanceFormComponent {
  public gameDef = input.required<GameDef>();
  public newGameInstance = output<GameInstance>();
  private fb = inject(FormBuilder);
  
  protected form = this.fb.group<GameFormType>({
    masterName: this.fb.control('', { nonNullable: true, validators: [Validators.required]}),
  });

  protected submit() {
    const gameInstanceForm = this.form.getRawValue();
    const selectedGameDef = this.gameDef();
    if (this.form.valid && gameInstanceForm) {
      const gameInstance: GameInstance = {
        id: `${selectedGameDef.id}-${gameInstanceForm.masterName}-${Date.now()}`,
        masterName: gameInstanceForm.masterName.replaceAll(' ', '-'),
        version: 0,
        gameDefId: selectedGameDef.id,
        gameDef: selectedGameDef,
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