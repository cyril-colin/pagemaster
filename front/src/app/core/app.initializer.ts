import { inject } from '@angular/core';
import { catchError, EMPTY, Observable, tap } from 'rxjs';
import { PageMasterSocketEvents } from '../../pagemaster-schemas/src/socket-events.types';
import { CurrentSessionState } from './current-session.state';
import { GameInstanceSocketService } from './game-instance-socket.service';
import { SocketService } from './socket.service';

export const appInitializer: () => Observable<unknown> = () => {
  const socketService = inject(SocketService);
  socketService.connect();
  const gameInstanceSocket = inject(GameInstanceSocketService);
  gameInstanceSocket.init();
  const currentSession = inject(CurrentSessionState);
  return currentSession.init().pipe(
    tap(session => {
      socketService.emit(PageMasterSocketEvents.JOIN_GAME_INSTANCE, { 
        gameInstanceId: session.gameInstance.id,
        participantId: session.participant.id,
      });
    }),
    catchError(() => {
      return EMPTY;
    }),
  );
};