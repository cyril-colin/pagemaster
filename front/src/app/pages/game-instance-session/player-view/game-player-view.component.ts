import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { Character, GameInstance, Player } from '@pagemaster/common/pagemaster.types';
import { CharacterFormComponent } from '../../../core/character/character-form.component';
import { CharacterQuickViewComponent } from '../../../core/character/character-quick-view.component';

@Component({
  selector: 'app-game-player-view',
  template: `
    @let player = currentPlayer();
    @let game = currentGame();
    <h2>Game player view for {{ player.name }} - {{ game.gameDef.name }}</h2>
    <button (click)="mode.set('list')">Players</button>
    <button (click)="mode.set('state')">My Status</button>
    
    @if (mode() === 'list') {
      <div class="list">
        @for (player of currentOtherPlayers(); track player.id) {
          <app-character-quick-view [character]="player.character" [gameDef]="game.gameDef" />
        }
      </div>
      
    }
    @if (mode() === 'state') {
      <app-character-form
          [existingCharacter]="player.character"
          [gameDef]="game.gameDef"
          (newCharacter)="saveCharacter($event, player)"
        />
    }


      

  `,
  styles: [`
    .list {
      display: flex;
      flex-direction: column;
      gap: var(--gap-large);
      width: 100%;
    }
  `],
  imports: [
    CharacterFormComponent,
    CharacterQuickViewComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GamePlayerViewComponent {
  public currentPlayer = input.required<Player>();
  public currentOtherPlayers = input.required<Player[]>();
  public currentGame = input.required<GameInstance>();
  public updatePlayer = output<Player>();

  protected mode = signal<'list' | 'state'>('list');

  protected saveCharacter(character: Character, player: Player): void {
    const updatedPlayer: Player = {
      ...player,
      character,
    };
    this.updatePlayer.emit(updatedPlayer);
  }
}