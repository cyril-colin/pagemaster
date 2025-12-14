import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { GameSession } from '@pagemaster/common/pagemaster.types';
import { PageMasterSocketEvents } from '@pagemaster/common/socket-events.types';
import { SmartRoutes } from 'src/app/app.routes';
import { CurrentGameSessionState } from 'src/app/core/current-game-session.state';
import { CurrentParticipantState } from 'src/app/core/current-participant.state';
import { SocketService } from '../../core/socket.service';

export function authGuard(route: ActivatedRouteSnapshot): boolean | UrlTree {
  const currentGameSession = inject(CurrentGameSessionState);
  const currentParticipantState = inject(CurrentParticipantState);
  const socketService = inject(SocketService);
  const router = inject(Router);

  const targetInstance = route.paramMap.get('instanceId');
  if (!targetInstance) {
    throw new Error('No instanceId in route parameters');
  }

  const currentParticipantId = currentParticipantState.currentParticipantId() || null;
  const currentGameSessionData = currentGameSession.currentGameSessionNullable() || null;

  const currentGameInstanceValid = (session: GameSession | null, target: string): boolean => {
    return !!(session && session.id === target);
  };

  const currentParticipantValid = (session: GameSession | null, participantId: string | null): boolean => {
    if (session?.master.id === participantId) {
      return true;
    }
    return !!(participantId && session?.players.some(p => p.id === participantId));
  };

  const goChooseAParticipant = (target: string): UrlTree => {
    const newRoute = SmartRoutes.publicLayout.children.lobby.path(target);
    return router.createUrlTree([newRoute]);
  };

  if (!currentGameInstanceValid(currentGameSessionData, targetInstance)) {
    return goChooseAParticipant(targetInstance);
  }

  if (!currentParticipantValid(currentGameSessionData, currentParticipantId)) {
    return goChooseAParticipant(targetInstance);
  }

  if (!currentGameSessionData || !currentParticipantId) {
    return goChooseAParticipant(targetInstance);
  }

  socketService.emit(PageMasterSocketEvents.JOIN_GAME_SESSION, {
    gameSessionId: targetInstance,
    participantId: currentParticipantId,
  });
  return true;
}