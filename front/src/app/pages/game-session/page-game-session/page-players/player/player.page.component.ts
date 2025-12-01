import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import {
  getPermissions,
} from '@pagemaster/common/permissions.types';
import { CurrentGameSessionState } from 'src/app/core/current-game-session.state';
import { CurrentParticipantState } from 'src/app/core/current-participant.state';
import { PageMasterRoutes } from 'src/app/core/pagemaster.router';
import { PlayerFormComponent } from 'src/app/core/player/player-form.component';
import { GameEventRepository } from 'src/app/core/repositories/game-event.repository';

@Component({
  selector: 'app-game-player-view',
  template: `
    <app-player-form
      [existingPlayer]="viewedPlayer()"
      [permissions]="permissions()"
    />
  `,
  styles: [`
    :host {
      display: flex;
      width: 100%;
      justify-content: center;
    }

    app-player-form {
      width: 100%;
      max-width: 800px;
    }
  `],
  imports: [
    PlayerFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerPageComponent {
  protected gameSession = inject(CurrentGameSessionState);
  protected participant = inject(CurrentParticipantState);
  protected currentSession = computed(() => {
    const gameSession = this.gameSession.currentGameSessionNullable();
    const participant = this.participant.currentParticipant();
    if (gameSession && participant) {
      return { gameSession, participant };
    }
    return null;
  });
  protected currentParticipantState = inject(CurrentParticipantState);
  protected gameEventRepository = inject(GameEventRepository);
  protected route = inject(ActivatedRoute);
  protected router = inject(Router);

  protected routeParams = toSignal(this.route.paramMap);

  protected players = computed(() => {
    return this.currentSession()!.gameSession.players;
  });

  protected viewedPlayer = computed(() => {
    const paramName = PageMasterRoutes().GameInstanceSession.params[1];
    const playerId = this.routeParams()?.get(paramName);
    if (!playerId) {
      throw new Error('Player ID parameter is missing in the route.');
    }
    const participant = this.players().find(p => p.id === playerId);
    if (!participant) {
      throw new Error(`Player with ID ${playerId} not found in current game instance.`);
    }
    return participant;
  });

  

  protected currentPlayerIndex = computed(() => {
    return this.players().findIndex(p => p.id === this.viewedPlayer().id);
  });

  protected navigateToPlayer(playerId: string): void {
    const instanceId = this.currentSession()!.gameSession.id;
    const route = PageMasterRoutes().GameInstanceSession;
    const basePath = route.interpolated(instanceId);
    void this.router.navigate([basePath, 'player', playerId]);
  }

  protected permissions = computed(() => {
    const isManager = this.currentParticipantState.allowedToEditPlayerSnapshot();
    const me = this.currentSession()!.participant;
    const isMyPlayer = me.id === this.viewedPlayer().id;
    return getPermissions(isManager, isMyPlayer);
  });
}