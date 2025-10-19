import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Player } from '../../../pagemaster-schemas/src/pagemaster.types';
import { CurrentSessionState } from '../../core/current-session.state';
import { GameInstanceService } from '../../core/repositories/game-instance.service';
import { GameMasterViewComponent } from './master-view/game-master-view.component';
import { GamePlayerViewComponent } from './player-view/game-player-view.component';

@Component({
  selector: 'app-game-instance-session',
  template: `
    <div>
      <h1>Game Instance Session</h1>
       @let session = currentSession.currentSession();
       @if (session) {
         @let p = players();
         @if (p.currentPlayer.type === 'gameMaster') {
            <app-game-master-view
              [gameMaster]="p.currentPlayer"
              [currentPlayers]="p.otherPlayers"
              [currentGame]="session.gameInstance"
              (updatePlayer)="saveCharacter($event)"
              (createItem)="gameInstanceService.addItem(session.gameInstance.id, $event).subscribe()"
            />
          } @else {
            <app-game-player-view 
              [currentPlayer]="p.currentPlayer"
              [currentOtherPlayers]="p.otherPlayers"
              [currentGame]="session.gameInstance"
              (updatePlayer)="saveCharacter($event)"
            />
          }
       }
    </div>
  `,
  styles: [],
  imports: [
    GameMasterViewComponent,
    GamePlayerViewComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameInstanceSessionComponent {
  protected route = inject(ActivatedRoute);
  protected currentSession = inject(CurrentSessionState);
  protected gameInstanceService = inject(GameInstanceService);

  protected players = computed(() => {
    const currentPlayer = this.currentSession.currentSession().participant;
    const selectedGame = this.currentSession.currentSession().gameInstance;
    const otherPlayers: Player[] = selectedGame.participants.filter(p => p.id !== currentPlayer.id).filter(p => p.type === 'player') || [];
    return { currentPlayer, otherPlayers };
  });
  protected saveCharacter(player: Player) {
    const session = this.currentSession.currentSession();
    this.gameInstanceService.updateParticipant(session.gameInstance.id, player).subscribe();
  }
}