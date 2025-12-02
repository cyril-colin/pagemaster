import { computed, inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { getPermissions } from '@pagemaster/common/permissions.types';
import { CurrentGameSessionState } from 'src/app/core/current-game-session.state';
import { CurrentParticipantState } from 'src/app/core/current-participant.state';
import { PageMasterRoutes } from 'src/app/core/pagemaster.router';
import { GameEventRepository } from 'src/app/core/repositories/game-event.repository';

@Injectable()
export class PlayerDataService {
  protected currentParticipantState = inject(CurrentParticipantState);
  protected gameEventRepository = inject(GameEventRepository);
  protected route = inject(ActivatedRoute);
  protected routeParams = toSignal(this.route.paramMap);

  protected gameSession = inject(CurrentGameSessionState);
  protected participant = inject(CurrentParticipantState);
  public currentSession = computed(() => {
    const gameSession = this.gameSession.currentGameSessionNullable();
    const participant = this.participant.currentParticipant();
    if (gameSession && participant) {
      return { gameSession, participant };
    }
    return null;
  });

  protected players = computed(() => {
    return this.currentSession()!.gameSession.players;
  });

  public viewedPlayer = computed(() => {
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


  public permissions = computed(() => {
    const isManager = this.currentParticipantState.allowedToEditPlayerSnapshot();
    const me = this.currentSession()!.participant;
    const isMyPlayer = me.id === this.viewedPlayer().id;
    return getPermissions(isManager, isMyPlayer);
  });
}