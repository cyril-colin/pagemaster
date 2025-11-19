import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { Router } from '@angular/router';
import { Participant, ParticipantType, Player } from '@pagemaster/common/pagemaster.types';
import { tap } from 'rxjs';
import { CurrentGameSessionState } from 'src/app/core/current-game-session.state';
import { CurrentParticipantState } from 'src/app/core/current-participant.state';
import { ButtonComponent } from 'src/app/core/design-system/button.component';
import { NewPlayerModalComponent } from 'src/app/core/game/new-player-modal.component';
import { ModalService } from 'src/app/core/modal';
import { PageMasterRoutes } from 'src/app/core/pagemaster.router';
import { PlayerButtonComponent } from 'src/app/core/player/player-button.component';
import { GameSessionRepository } from 'src/app/core/repositories/game-session.repository';

@Component({
  selector: 'app-main-menu',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let currentPlayer = participants().currentPlayer;
    @let otherPlayers = participants().otherPlayers;
    @if (currentPlayer) {
      <header>
        
        @if (currentPlayer.type === ParticipantType.GameMaster) {
          <div> 🎭 {{ currentPlayer.name }} (Game Master) </div>
        } @else {
          <app-player-button (click)="goToParticipantPage(currentPlayer)" [player]="currentPlayer"
          />
        }
        <ds-button mode="secondary-danger" (click)="logout()" [icon]="'logout'"/>
      </header>
      <nav>
        @if (otherPlayers.length > 0) {
          @for (player of otherPlayers; track player.id) {
            <div class="player-item">
              <app-player-button 
                (click)="goToParticipantPage(player)"
                [player]="player"
              />
              @if (participants().currentPlayer.type === ParticipantType.GameMaster) {
                <ds-button mode="secondary-danger" (click)="deletePlayer(player)" [icon]="'trash'"/>
              }
            </div>
          }
        }
        @if (otherPlayers.length === 0 && !currentPlayer) {
          <p>No players in this session.</p>
        }
      </nav>

      @if (currentPlayer.type === ParticipantType.GameMaster) {
        <footer>
          <ds-button [mode]="'primary'" (click)="addPlayer()" [icon]="'plus'">New Player</ds-button>
        </footer>
      }
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
  imports: [ButtonComponent, PlayerButtonComponent],
})
export class MainMenuComponent {
  public close = output<void>();

  private router = inject(Router);
  private modalService = inject(ModalService);
  private gameInstanceRepository = inject(GameSessionRepository);
  private currentGameSession = inject(CurrentGameSessionState);
  private currentParticipant = inject(CurrentParticipantState);
  protected ParticipantType = ParticipantType;

  protected participants = computed(() => {
    const currentParticipant = this.currentParticipant.currentParticipant();
    if (!currentParticipant) {
      // Return empty state when logged out
      return { currentPlayer: null as unknown as Participant, otherPlayers: [] };
    }
    if (currentParticipant.type === ParticipantType.GameMaster) {
      return { currentPlayer: currentParticipant, otherPlayers: this.currentGameSession.currentGameSession().players || [] };
    }
    const currentSession = this.currentGameSession.currentGameSession();
    const otherPlayers: Player[] = currentSession.players
      .filter(p => p.id !== currentParticipant.id).filter(p => p.type === 'player') || [];
    return { currentPlayer: currentParticipant, otherPlayers };
  });


  protected async goToParticipantPage(participant: Participant): Promise<void> {
    const route = PageMasterRoutes().GameInstanceSession.children[2].interpolated(participant.id);

    const gameSessionId = this.currentGameSession.currentGameSession().id;
    const parentRoute = PageMasterRoutes().GameInstanceSession.interpolated(gameSessionId);
    const segments = [parentRoute, route].join('/').split('/');
    await this.router.navigate(segments);
    this.close.emit();
  }
  
  protected logout(): void {
    this.currentParticipant.logout();
    this.close.emit();
  }

  protected addPlayer(): void {
    const modalRef = this.modalService.open(NewPlayerModalComponent);
    
    modalRef.componentRef.instance.result.subscribe((player) => {
      if (player) {
        const gameSession = this.currentGameSession.currentGameSession();
        if (gameSession) {
          this.gameInstanceRepository.addParticipant(gameSession.id, player).pipe(
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
      const gameSession = this.currentGameSession.currentGameSession();
      if (gameSession) {
        this.gameInstanceRepository.deleteParticipant(gameSession.id, player.id).subscribe();
      }
    }
  }
}