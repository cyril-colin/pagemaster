import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { Player } from '@pagemaster/common/pagemaster.types';
import { tap } from 'rxjs';
import { CharacterButtonComponent } from 'src/app/core/character/character-button.component';
import { CurrentGameInstanceState } from 'src/app/core/current-game-instance.state';
import { CurrentSessionState } from 'src/app/core/current-session.state';
import { ButtonComponent } from 'src/app/core/design-system/button.component';
import { NewPlayerModalComponent } from 'src/app/core/game/new-player-modal.component';
import { ModalService } from 'src/app/core/modal';
import { GameInstanceRepository } from 'src/app/core/repositories/game-instance.repository';

@Component({
  selector: 'app-main-menu',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header>
      @if (participants().currentPlayer.type === 'gameMaster') {
        <div> 🎭 {{ participants().currentPlayer.name }} (Game Master) </div>
      } @else {
        <app-character-button (click)="onCurrentPlayerClick()" [character]="getCurrentPlayerCharacter()!"
        />
      }
      <ds-button mode="secondary-danger" (click)="logout()" [icon]="'logout'"/>
    </header>
    <nav>
      @if (participants().otherPlayers.length > 0) {
        @for (player of participants().otherPlayers; track player.id) {
          <div class="player-item">
            <app-character-button 
              (click)="onPlayerClick(player)"
              [character]="player.character"
            />
            @if (participants().currentPlayer.type === 'gameMaster') {
              <ds-button mode="secondary-danger" (click)="deletePlayer(player)" [icon]="'trash'"/>
            }
          </div>
        }
      }
      @if (participants().otherPlayers.length === 0 && !participants().currentPlayer) {
        <p>No players in this session.</p>
      }
    </nav>

    @if (participants().currentPlayer.type === 'gameMaster') {
      <footer>
        <ds-button [mode]="'primary-danger'" (click)="addPlayer()" [icon]="'plus'">New Player</ds-button>
      </footer>
    }
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100vh;
      width: 100vw;
      background-color: var(--color-background-main);
      overflow: hidden;
      border-right: var(--view-border);
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--padding-small);
      background-color: var(--color-background-secondary);
      border-bottom: var(--view-border);
      box-shadow: 0 2px 4px var(--color-shadow-heavy);
      flex-shrink: 0;

      ds-button {
        position: absolute;
        display: block;
        right: var(--card-padding);
      }
    }

    header div {
      font-size: var(--text-size-xlarge);
      font-weight: var(--text-weight-bold);
      color: var(--text-primary);
    }

    nav {
      flex: 1;
      padding: var(--padding-small);
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: var(--gap-medium);
      min-height: 0;
    }

    nav p {
      text-align: center;
      color: var(--text-secondary);
      font-size: var(--text-size-large);
      margin: 0;
      font-style: italic;
    }

    .player-item {
      position: relative;
      width: 100%;

      ds-button {
        position: absolute;
        display: block;
        right: var(--card-padding);
        top: 50%;
        transform: translateY(-50%);
      }
    }

    footer {
      padding: var(--padding-small);
      background-color: var(--color-background-secondary);
      border-top: var(--view-border);
      flex-shrink: 0;
      display: flex;
      justify-content: center;
    }
  `],
  imports: [ButtonComponent, CharacterButtonComponent],
})
export class MainMenuComponent {
  public close = output<void>();
  public playerClick = output<Player>();

  private modalService = inject(ModalService);
  private gameInstanceRepository = inject(GameInstanceRepository);
  private currentSession = inject(CurrentSessionState);
  private currentGameInstance = inject(CurrentGameInstanceState);

  protected participants = computed(() => {
    const currentPlayer = this.currentSession.currentSession().participant;
    const selectedGame = this.currentSession.currentSession().gameInstance;
    const otherPlayers: Player[] = selectedGame.participants.filter(p => p.id !== currentPlayer.id).filter(p => p.type === 'player') || [];
    return { currentPlayer, otherPlayers };
  });
  
  protected onPlayerClick(player: Player): void {
    this.playerClick.emit(player);
    this.close.emit(); // Close menu after player selection
  }
  
  protected onCurrentPlayerClick(): void {
    const current = this.participants().currentPlayer;
    if (current && current.type === 'player') {
      this.onPlayerClick(current);
    }
  }
  
  protected getCurrentPlayerCharacter() {
    const current = this.participants().currentPlayer;
    if (current && current.type === 'player') {
      return current.character;
    }
    return null;
  }
  
  protected logout(): void {
    this.currentSession.logout();
    this.close.emit();
  }

  protected addPlayer(): void {
    const modalRef = this.modalService.open(NewPlayerModalComponent);
    
    modalRef.componentRef.instance.result.subscribe((player) => {
      if (player) {
        const gameInstance = this.currentGameInstance.currentGameInstance();
        if (gameInstance) {
          this.gameInstanceRepository.addParticipant(gameInstance.id, player).pipe(
            tap(() => void modalRef.close()),
          ).subscribe();
        }
      } else {
        void modalRef.close();
      }
    });
  }

  protected async deletePlayer(player: Player): Promise<void> {
    const title = `Delete Player "${player.name}"`;
    const description = 'This action cannot be undone.';
    const confirmation = await this.modalService.confirmation(description, title);
    if (confirmation === 'confirmed') {
      const gameInstance = this.currentGameInstance.currentGameInstance();
      if (gameInstance) {
        this.gameInstanceRepository.deleteParticipant(gameInstance.id, player.id).subscribe();
      }
    }
  }
}