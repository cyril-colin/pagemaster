import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { GameInstance, Participant } from '@pagemaster/common/pagemaster.types';
import { PageMasterSocketEvents } from '@pagemaster/common/socket-events.types';
import { CurrentSessionState } from '../../core/current-session.state';
import { PageMasterRoutes } from '../../core/pagemaster.router';
import { SocketService } from '../../core/socket.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  protected currentSession = inject(CurrentSessionState);
  protected socketService = inject(SocketService);
  protected router = inject(Router);
  public canActivate: CanActivateFn = ((route: ActivatedRouteSnapshot) => {
    const currentParticipant = this.currentSession.currentSessionNullable()?.participant || null;
    const currentGameInstance = this.currentSession.currentSessionNullable()?.gameInstance || null;
    const targetInstance = route.paramMap.get(PageMasterRoutes().GameInstanceSession.params[0]);
    if (!targetInstance) {
      throw new Error('No instanceId in route parameters');
    }

    if (!this.currentGameInstanceValid(currentGameInstance, targetInstance)) {
      return this.goChooseAParticipant(targetInstance);
    }

    if (!this.currentParticipantValid(currentGameInstance, currentParticipant)) {
      return this.goChooseAParticipant(targetInstance);
    }

    if (!currentGameInstance || !currentParticipant) {
      return this.goChooseAParticipant(targetInstance);
    }

    this.socketService.emit(PageMasterSocketEvents.JOIN_GAME_INSTANCE, {
      gameInstanceId: targetInstance,
      participantId: currentParticipant.id,
    });
    return true;
  });

  private currentGameInstanceValid(currentGameInstance: GameInstance | null, targetInstance: string): boolean {
    return !!(currentGameInstance && currentGameInstance.id === targetInstance);
  }

  private currentParticipantValid(currentGameInstance: GameInstance | null, participant: Participant | null): boolean {
    return !!(participant && currentGameInstance?.participants.some(p => p.id === participant.id));
  }

  private goChooseAParticipant(targetInstance: string) {
    const newRoute = PageMasterRoutes().GameInstanceSessionChooseParticipant.interpolated(targetInstance);
    return this.router.createUrlTree([newRoute]);
  }
}