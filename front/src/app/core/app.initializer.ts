import { inject } from '@angular/core';
import { PageMasterSocketEvents } from '@pagemaster/common/socket-events.types';
import { catchError, EMPTY, Observable, switchMap, tap } from 'rxjs';
import { CurrentGameSessionState } from './current-game-session.state';
import { CurrentParticipantState } from './current-participant.state';
import { GameSessionSocketService } from './game-session-socket.service';
import { ResourcePacksStorage } from './resource-packs-storage.service';
import { SocketService } from './socket.service';

export const appInitializer: () => Observable<unknown> = () => {
  const socketService = inject(SocketService);
  socketService.connect();
  const gameInstanceSocket = inject(GameSessionSocketService);
  gameInstanceSocket.init();
  const currentGameSession = inject(CurrentGameSessionState);
  const currentParticipantState = inject(CurrentParticipantState);
  const currentSessionInit = currentGameSession.init().pipe(
    tap(gameSession => {
      if (!gameSession) {
        throw new Error('No current game instance set');
      }
      return currentParticipantState.init(gameSession);
    }),
    tap(() => {
      socketService.emit(PageMasterSocketEvents.JOIN_GAME_SESSION, { 
        gameSessionId: currentGameSession.currentGameSession().id,
        participantId: currentParticipantState.currentParticipantId()!,
      });
    }),
    catchError(() => {
      return EMPTY;
    }),
  );

  return inject(ResourcePacksStorage).init().pipe(
    switchMap(() => currentSessionInit),
  );
};