import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { Router } from '@angular/router';
import { Player } from '@pagemaster/common/pagemaster.types';
import { tap } from 'rxjs';
import { CharacterButtonComponent } from 'src/app/core/character/character-button.component';
import { CurrentGameInstanceState } from 'src/app/core/current-game-instance.state';
import { CurrentSessionState } from 'src/app/core/current-session.state';
import { ButtonComponent } from 'src/app/core/design-system/button.component';
import { NewPlayerModalComponent } from 'src/app/core/game/new-player-modal.component';
import { ModalService } from 'src/app/core/modal';
import { PageMasterRoutes } from 'src/app/core/pagemaster.router';
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
        <ds-button [mode]="'primary'" (click)="addPlayer()" [icon]="'plus'">New Player</ds-button>
      </footer>
    }
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
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

  private router = inject(Router);
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
  
  protected async onPlayerClick(player: Player): Promise<void> {
    await this.goToPlayerPage(player);
  }

  protected async onCurrentPlayerClick(): Promise<void> {
    const current = this.participants().currentPlayer;
    if (current && current.type === 'player') {
      await this.onPlayerClick(current);
    }
  }

  private async goToPlayerPage(player: Player): Promise<void> {
    const route = PageMasterRoutes().GameInstanceSession.children[2].interpolated(
      player.id,
    );

    const gameInstanceId = this.currentGameInstance.currentGameInstance()!.id;
    const parentRoute = PageMasterRoutes().GameInstanceSession.interpolated(gameInstanceId);
    const segments = ['/'+parentRoute, route].join('/').split('/');
    await this.router.navigate(segments);
    this.close.emit();
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