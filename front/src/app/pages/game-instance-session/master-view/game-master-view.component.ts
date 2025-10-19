import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { Item } from '@pagemaster/common/items.types';
import { Character, GameInstance, GameMaster, Player } from '@pagemaster/common/pagemaster.types';
import { CharacterFormComponent } from '../../../core/character/character-form.component';
import { ItemFormComponent } from '../../../core/items/item-form.component';

@Component({
  selector: 'app-game-master-view',
  template: `

    @let players = currentPlayers();
    @let game = currentGame();
    <h2>Game master view for {{ gameMaster().name }} - {{ game.gameDef.name }}</h2>

    <div>
      <button (click)="switchCreateItemMode()">Create item</button>
      @if (createItemMode()) {
        <app-item-form (newItem)="createItem.emit($event)"/>
      }
    </div>

    <div>
      <button (click)="previousCharacter()">Previous Character</button>
      <button (click)="nextCharacter()">Next Character</button>
      @for(player of players; track player.id) {
        @if (displayedCharacter().character.id === player.character.id) {
          <app-character-form
            [existingCharacter]="player.character"
            [gameDef]="game.gameDef"
            (newCharacter)="saveCharacter($event, player)"
          />
        }
      }
    </div>
  `,
  styles: [],
  imports: [CharacterFormComponent, ItemFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameMasterViewComponent {
  public gameMaster = input.required<GameMaster>();
  public currentPlayers = input.required<Player[]>();
  public currentGame = input.required<GameInstance>();
  public updatePlayer = output<Player>();
  public createItemMode = signal<boolean>(false);
  public createItem = output<Item>();
  protected switchCreateItemMode(): void {
    this.createItemMode.update(mode => !mode);
  }

  protected displayedCharacterIndex = signal(0);
  protected displayedCharacter = computed(() => {
    return this.currentPlayers()[this.displayedCharacterIndex()];
  });

  protected nextCharacter(): void {
    const players = this.currentPlayers();
    this.displayedCharacterIndex.update(index => (index + 1) % players.length);
  }

  protected previousCharacter(): void {
    this.displayedCharacterIndex.update(index => {
      const players = this.currentPlayers();
      return (index - 1 + players.length) % players.length;
    });
  }

  protected saveCharacter(character: Character, player: Player): void {
    const updatedPlayer: Player = {
      ...player,
      character,
    };
    this.updatePlayer.emit(updatedPlayer);
  }
}