import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Player } from '@pagemaster/common/pagemaster.types';
import { CharacterButtonComponent } from 'src/app/core/character/character-button.component';
import { CharacterSmallComponent } from 'src/app/core/character/character-small.component';
import { CurrentSessionState } from 'src/app/core/current-session.state';
import { PageMasterRoutes } from 'src/app/core/pagemaster.router';
import { GameInstanceService } from 'src/app/core/repositories/game-instance.service';

@Component({
  selector: 'app-game-instance',
  template: `
  @let players = this.players();
  @let session = currentSession.currentSession();
  <section class="section-current-user">
    @if (session.participant.type === 'player') {
      <app-character-small (clicked)="goToPlayerPage(session.participant)"
      [character]="session.participant.character"
      [gameDef]="session.gameInstance.gameDef"
      />
    } @else {
      {{ session.participant.name }} (Game Master)
    }
    
  </section>
  <section class="section-game-instance">
    <router-outlet></router-outlet>
  </section>

  <section class="section-other-characters">
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
      align-items: stretch;
      box-sizing: border-box;
      height: 100%;
      width: 100%;

      .section-current-user {
        flex-shrink: 0;
        padding: var(--gap-large);
        padding-bottom: var(--gap-medium);
      }

      .section-game-instance {
        flex: 1;
        overflow-y: auto;
        padding: 0 var(--gap-large);
      }

      .section-other-characters {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        display: flex;
        flex-direction: row;
        justify-content: center;
        gap: var(--gap-medium);
        overflow-x: auto;
        padding: var(--gap-medium) var(--gap-large);
        border-top: 1px solid var(--border-color, #ccc);

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
  protected currentSession = inject(CurrentSessionState);
  protected gameInstanceService = inject(GameInstanceService);

  protected players = computed(() => {
    const currentPlayer = this.currentSession.currentSession().participant;
    const selectedGame = this.currentSession.currentSession().gameInstance;
    const otherPlayers: Player[] = selectedGame.participants.filter(p => p.id !== currentPlayer.id).filter(p => p.type === 'player') || [];
    return { currentPlayer, otherPlayers };
  });

  protected goToPlayerPage(player: Player): void {
    const route = PageMasterRoutes().GameInstanceSessionPlayer.interpolated(
      this.currentSession.currentSession().gameInstance.id,
      player.id,
    );
    void this.router.navigate([route]);
  }
}