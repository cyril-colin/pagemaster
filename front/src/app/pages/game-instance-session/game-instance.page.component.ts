import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Player } from '@pagemaster/common/pagemaster.types';
import { CharacterButtonComponent } from 'src/app/core/character/character-button.component';
import { CharacterSmallComponent } from 'src/app/core/character/character-small.component';
import { CurrentSessionState } from 'src/app/core/current-session.state';
import { EventsCenterStateService } from 'src/app/core/events-center/events-center.state';
import { PageMasterRoutes } from 'src/app/core/pagemaster.router';
import { GameInstanceRepository } from 'src/app/core/repositories/game-instance.repository';

@Component({
  selector: 'app-game-instance',
  template: `
  @let players = this.players();
  @let session = currentSession.currentSession();
  <section class="header">
    <div class="links">
      <a [routerLink]="eventsRoute()">
      Events page ({{ eventService.events().length }})
    </a>

    <a href="" (click)="$event.preventDefault(); currentSession.logout()">
      logout
    </a>
    </div>
    
    @if (session.participant.type === 'player') {
      <app-character-small (clicked)="goToPlayerPage(session.participant)"
      [character]="session.participant.character"
      [gameDef]="session.gameInstance.gameDef"
      />
    } @else {
      <div>
      {{ session.participant.name }} (Game Master)
      </div>
    }
  </section>

  <section class="main-content">
    <router-outlet></router-outlet>
  </section>

  <section class="footer">
    @for (player of players.otherPlayers; track player.id) {
      <app-character-button (click)="goToPlayerPage(player)"
        [character]="player.character"
      />
    }
  </section>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      --header-height: 140px;
      --footer-height: 100px;
      padding-top: var(--header-height);
      padding-bottom: var(--footer-height);

      .header {
        position: fixed;
        z-index: 1;
        top: 0;
        left: 0;
        right: 0;
        width: 100%;
        height: var(--header-height);
        background-color: var(--color-background-main);
        border-bottom: var(--view-border);
      }

      .links {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        padding: var(--gap-medium);

        a {
          border: var(--view-border);
          border-radius: var(--view-border-radius);
          padding: var(--gap-small);
          text-decoration: none;

          &:hover {
            background-color: var(--color-background-hover);
          }
        }
      }

      .main-content {
        display: flex;
        flex-direction: column;
        width: 100%;
        align-items: center;
      }

      .footer {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        display: flex;
        flex-direction: row;
        width: 100%;
        height: var(--footer-height);
        justify-content: center;
        gap: var(--gap-medium);
        overflow-x: auto;
        background-color: var(--color-background-main);
        border-top: var(--view-border);
      }
    }`],
  imports: [
    RouterModule,
    CharacterSmallComponent,
    CharacterButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameInstancePageComponent {
  protected router = inject(Router);
  protected route = inject(ActivatedRoute);
  protected currentSession = inject(CurrentSessionState);
  protected gameInstanceService = inject(GameInstanceRepository);
  protected eventService = inject(EventsCenterStateService);
  protected eventsRoute = computed(() => '/' + PageMasterRoutes().GameInstanceSession.interpolated(
    this.currentSession.currentSession().gameInstance.id,
  ));

  constructor() {
    toSignal(this.eventService.init(this.currentSession.currentSession().gameInstance.id));
  }

  protected players = computed(() => {
    const currentPlayer = this.currentSession.currentSession().participant;
    const selectedGame = this.currentSession.currentSession().gameInstance;
    const otherPlayers: Player[] = selectedGame.participants.filter(p => p.id !== currentPlayer.id).filter(p => p.type === 'player') || [];
    return { currentPlayer, otherPlayers };
  });

  protected goToPlayerPage(player: Player): void {
    const route = PageMasterRoutes().GameInstanceSession.children[2].interpolated(
      player.id,
    );
    void this.router.navigate([route], { relativeTo: this.route });
  }
}