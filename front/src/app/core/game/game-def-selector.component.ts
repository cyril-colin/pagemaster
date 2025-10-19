import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { GameDef } from '../../../pagemaster-schemas/src/pagemaster.types';

@Component({
  selector: 'app-game-def-selector',
  template: `
    <h2>Start a new game session</h2>
    @let games = gameDefs();
    @if (games?.length) {
      <form [formGroup]="form()" (ngSubmit)="select()">
        <label for="gameDef">Game Definition</label>
        <select [formControl]="form().controls.gameDef" id="gameDef">
          <option value="" disabled>Select a game definition</option>
          @for (gameDef of games ; track gameDef.id) {
            <option [value]="gameDef">{{ gameDef.name }}</option>
          }
        </select>
        <button type="submit">Select</button>
      </form>
    } @else { 
      <p>No game definitions available. Please create a game definition first.</p>
    }
  `,
  styles: [''],
  imports: [
    ReactiveFormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameDefSelectorComponent {
  public gameDefs = input.required<GameDef[]>();
  public selectedGameDef = output<GameDef>();
  private fb = inject(FormBuilder);
  protected form = computed(() => {
    return this.fb.group({
      gameDef: [this.gameDefs()[0] || null],
    });
  });

  protected select() {
    const selection = this.form().getRawValue().gameDef;
    if (this.form().valid && selection) {
      this.selectedGameDef.emit(selection);
    }
    
  }
}