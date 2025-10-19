import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { map, Observable } from 'rxjs';
import { Character, GameDef, GameInstance } from '../../../pagemaster-schemas/src/pagemaster.types';


interface PlayerItem {
  name: FormControl<string>,
  position: FormControl<number>,
  characterName: FormControl<string>,
}

interface GameFormType {
  masterName: FormControl<string>,
  players: FormArray<FormGroup<PlayerItem>>,
}

@Component({
  selector: 'app-game-instance-form',
  template: `
    <h2>Setup your players for the {{ gameDef().name }} session !</h2>
    <form [formGroup]="form()" (ngSubmit)="submit()">
      @let errorList = errors$ | async;
      @if (errorList) {
        <div class="errors">
          @for(errorKey of (errorList | keyvalue); track errorKey.key) {
            <p>Error: {{ errorKey.key }} - {{ errorKey.value }}</p>
          }
        </div>
      }
      <label for="masterName">Game Master Name</label>
      <input id="masterName" [formControl]="form().controls.masterName" type="text" />
      @for (playerCtrl of form().controls.players.controls; track $index; let i = $index) {
            <div>
              <label for="name-{{i}}">Player Name</label>
              <input id="name-{{i}}" [formControl]="playerCtrl.controls.name" type="text" />

              <label for="characterName-{{i}}">Character Name</label>
              <input id="characterName-{{i}}" [formControl]="playerCtrl.controls.characterName" type="text" />
              <label for="characterPosition-{{i}}">Character Position</label>
              <input id="characterPosition-{{i}}" [formControl]="playerCtrl.controls.position" type="number" />


               @if (form().controls.players.controls.length > gameDef().minPlayers) {
                <button type="button" (click)="removePlayer(i)">Remove Player</button>
              }
            </div>
          }
          @if (form().controls.players.controls.length < gameDef().maxPlayers) {
            <button type="button" (click)="addPlayer()">Add Player</button>
          }
        <button type="submit" [disabled]="form().invalid">Create Game Instance</button>
    </form>
  `,
  styles: [''],
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameInstanceFormComponent implements OnInit  {
  public gameDef = input.required<GameDef>();
  public newGameInstance = output<GameInstance>();
  public fb = inject(FormBuilder);
  

  protected form = computed(() => {
    const gameDef = this.gameDef();

    const defaultPlayers = Array.from({ length: gameDef.minPlayers }, () => this.createDefaultPlayer());
    return this.fb.group<GameFormType>({
      masterName: this.fb.control('', { nonNullable: true, validators: [Validators.required]}),
      players: this.fb.array<FormGroup<PlayerItem>>(defaultPlayers, {validators: [
        Validators.minLength(gameDef.minPlayers),
        Validators.maxLength(gameDef.maxPlayers),
      ]}),
    });
  });

  protected errors$!: Observable<ValidationErrors | null>;

  ngOnInit() {
    this.errors$ = this.form().valueChanges.pipe(map(() => {
      const form = this.form();
      const allErrors: Record<string, unknown> = {};
      
      // Get form-level errors
      if (form.errors) {
        Object.assign(allErrors, form.errors);
      }
      
      // Get individual control errors
      Object.keys(form.controls).forEach(key => {
        const control = form.get(key);
        if (control && control.errors) {
          allErrors[key] = control.errors;
        }
      });
      
      // Get players array errors
      const playersArray = form.controls.players;
      if (playersArray.errors) {
        allErrors['players'] = playersArray.errors;
      }
      
      // Get individual player control errors
      playersArray.controls.forEach((playerGroup, index) => {
        Object.keys(playerGroup.controls).forEach(playerKey => {
          const playerControl = playerGroup.get(playerKey);
          if (playerControl && playerControl.errors) {
            allErrors[`player${index}_${playerKey}`] = playerControl.errors;
          }
        });
      });
      
      return Object.keys(allErrors).length > 0 ? allErrors : null;
    }));
  }

  protected formErrors = computed(() => this.form().errors);

  protected submit() {
    const gameInstanceForm = this.form().getRawValue();
    const selectedGameDef = this.gameDef();
    if (this.form().valid && gameInstanceForm) {
      const gameInstance: GameInstance = {
        id: `${selectedGameDef.id}-${gameInstanceForm.masterName}-${Date.now()}`,
        masterName: gameInstanceForm.masterName.replaceAll(' ', '-'),
        gameDefId: selectedGameDef.id,
        gameDef: selectedGameDef,
        participants: gameInstanceForm.players.map((player, index) => ({
          id: `player-${player.name}-${index}`,
          type: 'player',
          name: player.name,
          position: index,
          character: this.generateDefaultCharacter(player.characterName),
        })),
      };

      gameInstance.participants.push({
        id: `gamemaster-${gameInstanceForm.masterName}`,
        type: 'gameMaster',
        name: gameInstanceForm.masterName.replaceAll(' ', '-'),
      });
      this.newGameInstance.emit(gameInstance);
    }
    
  }


  protected generateDefaultCharacter(name: string): Character {
    return {
      id: '',
      name: name,
      description: '',
      picture: '',
      attributes: {
        bar: [],
        status: [],
        inventory: [],
        strength: [],
        weakness: [],
      },
      skills: [],
    };
  }

  protected createDefaultPlayer(): FormGroup<PlayerItem> {
    return this.fb.group<PlayerItem>({
      name: this.fb.control('', { nonNullable: true, validators: [Validators.required]}),
      position: this.fb.control(0, { nonNullable: true }),
      characterName: this.fb.control('', { nonNullable: true, validators: [Validators.required]}),
    });
  }

  protected addPlayer() {
    if (this.form().controls.players.length >= this.gameDef().maxPlayers) {
      return;
    }
    const playerGroup = this.createDefaultPlayer();
    this.form().controls.players.push(playerGroup);
  }


  protected removePlayer(index: number) {
    this.form().controls.players.removeAt(index);
    // Update position values for remaining players
    this.form().controls.players.controls.forEach((control, i) => {
      control.controls.position.setValue(i);
    });
  }
}