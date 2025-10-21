import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Character, Player } from '@pagemaster/common/pagemaster.types';
import { map } from 'rxjs';
import { CharacterFormComponent } from 'src/app/core/character/character-form.component';
import { CurrentSessionState } from 'src/app/core/current-session.state';
import { PageMasterRoutes } from 'src/app/core/pagemaster.router';
import { GameInstanceService } from 'src/app/core/repositories/game-instance.service';

@Component({
  selector: 'app-game-player-view',
  template: `
    @let game = currentSession.currentSession().gameInstance;
    <app-character-form
      [existingCharacter]="currentPlayer().character"
      [gameDef]="game.gameDef"
      (newCharacter)="saveCharacter($event, currentPlayer())"
    />
  `,
  styles: [`
    :host {
      display: flex;
      width: 100%;
    }
  `],
  imports: [
    CharacterFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerPageComponent {
  protected currentSession = inject(CurrentSessionState);
  protected gameInstanceService = inject(GameInstanceService);
  protected route = inject(ActivatedRoute);

  protected currentPlayer: Signal<Player> = toSignal(this.route.paramMap.pipe(
    map(params => {
      const paramName = PageMasterRoutes().GameInstanceSessionPlayer.params[1];
      const playerId = params.get(paramName);
      if (!playerId) {
        throw new Error('Player ID parameter is missing in the route.');
      }
      const participant = this.currentSession.currentSession().gameInstance.participants.find(p => p.id === playerId);
      if (!participant) {
        throw new Error(`Player with ID ${playerId} not found in current game instance.`);
      }
      if (participant.type !== 'player') {
        throw new Error(`Participant with ID ${playerId} is not a player.`);
      }
      return participant;
    }),
  ), { requireSync: true });

  protected saveCharacter(character: Character, player: Player): void {
    const updatedPlayer: Player = {
      ...player,
      character,
    };
    this.gameInstanceService.updateParticipant(this.currentSession.currentSession().gameInstance.id, updatedPlayer).subscribe();
  }
}