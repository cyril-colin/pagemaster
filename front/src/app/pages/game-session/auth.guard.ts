import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { GameSession } from '@pagemaster/common/pagemaster.types';
import { PageMasterSocketEvents } from '@pagemaster/common/socket-events.types';
import { CurrentGameSessionState } from 'src/app/core/current-game-session.state';
import { CurrentParticipantState } from 'src/app/core/current-participant.state';
import { PageMasterRoutes } from '../../core/pagemaster.router';
import { SocketService } from '../../core/socket.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  protected currentGameSession = inject(CurrentGameSessionState);
  protected currentParticipantState = inject(CurrentParticipantState);
  protected socketService = inject(SocketService);
  protected router = inject(Router);
  public canActivate: CanActivateFn = ((route: ActivatedRouteSnapshot) => {
    const currentParticipantId = this.currentParticipantState.currentParticipantId() || null;
    const currentGameSession = this.currentGameSession.currentGameSessionNullable() || null;
    const targetInstance = route.paramMap.get(PageMasterRoutes().GameInstanceSession.params[0]);
    if (!targetInstance) {
      throw new Error('No instanceId in route parameters');
    }

    if (!this.currentGameInstanceValid(currentGameSession, targetInstance)) {
      return this.goChooseAParticipant(targetInstance);
    }

    if (!this.currentParticipantValid(currentGameSession, currentParticipantId)) {
      return this.goChooseAParticipant(targetInstance);
    }

    if (!currentGameSession || !currentParticipantId) {
      return this.goChooseAParticipant(targetInstance);
    }

    this.socketService.emit(PageMasterSocketEvents.JOIN_GAME_SESSION, {
      gameSessionId: targetInstance,
      participantId: currentParticipantId,
    });
    return true;
  });

  private currentGameInstanceValid(currentGameSession: GameSession | null, targetInstance: string): boolean {
    return !!(currentGameSession && currentGameSession.id === targetInstance);
  }

  private currentParticipantValid(currentGameSession: GameSession | null, participantId: string | null): boolean {
    if (currentGameSession?.master.id === participantId) {
      return true;
    }
    return !!(participantId && currentGameSession?.players.some(p => p.id === participantId));
  }

  private goChooseAParticipant(targetInstance: string) {
    const newRoute = PageMasterRoutes().GameInstanceSessionChooseParticipant.interpolated(targetInstance);
    return this.router.createUrlTree([newRoute]);
  }
}