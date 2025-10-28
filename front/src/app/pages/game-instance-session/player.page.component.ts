import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Character, Player } from '@pagemaster/common/pagemaster.types';
import { Bar } from 'src/app/core/character/bars/bars-control.component';
import { CharacterFormComponent } from 'src/app/core/character/character-form.component';
import { CurrentSessionState } from 'src/app/core/current-session.state';
import { PageMasterRoutes } from 'src/app/core/pagemaster.router';
import { GameInstanceRepository } from 'src/app/core/repositories/game-instance.repository';

@Component({
  selector: 'app-game-player-view',
  template: `
    @let game = currentSession.currentSession().gameInstance;
    <app-character-form
      [existingCharacter]="viewedPlayer().character"
      [gameDef]="game.gameDef"
      (newCharacter)="saveCharacter($event, viewedPlayer())"
      (renameEvent)="renameParticipant($event.value, viewedPlayer())"
      (avatarEvent)="updateAvatar($event.value, viewedPlayer())"
      (descriptionEvent)="updateDescription($event.value, viewedPlayer())"
      (barsEvent)="updateBars($event, viewedPlayer())"
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
  protected gameInstanceService = inject(GameInstanceRepository);
  protected route = inject(ActivatedRoute);

  protected routeParams = toSignal(this.route.paramMap);

  protected viewedPlayer = computed(() => {
    const paramName = PageMasterRoutes().GameInstanceSession.params[1];
    const playerId = this.routeParams()?.get(paramName);
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
  });

  protected saveCharacter(character: Character, player: Player): void {
    const updatedPlayer: Player = {
      ...player,
      character,
    };
    this.gameInstanceService.updateParticipant(this.currentSession.currentSession().gameInstance.id, updatedPlayer).subscribe();
  }

  protected renameParticipant(newName: string, player: Player): void {
    const participantId = player.id;
    const gameInstanceId = this.currentSession.currentSession().gameInstance.id;
    this.gameInstanceService.renameCharacter(gameInstanceId, participantId, { name: newName }).subscribe();
  }

  protected updateAvatar(newAvatar: string, player: Player): void {
    const participantId = player.id;
    const gameInstanceId = this.currentSession.currentSession().gameInstance.id;
    this.gameInstanceService.updateCharacterAvatar(gameInstanceId, participantId, { picture: newAvatar }).subscribe();
  }

  protected updateDescription(newDescription: string, player: Player): void {
    const participantId = player.id;
    const gameInstanceId = this.currentSession.currentSession().gameInstance.id;
    this.gameInstanceService.updateCharacterDescription(gameInstanceId, participantId, { description: newDescription }).subscribe();
  }

  protected updateBars(bars: Bar[], player: Player): void {
    const participantId = player.id;
    const gameInstanceId = this.currentSession.currentSession().gameInstance.id;
    const selectedBars = bars.filter(b => b.selected).map(b => b.instance);
    this.gameInstanceService.updateCharacterBars(gameInstanceId, participantId, { bar: selectedBars }).subscribe();
  }
}