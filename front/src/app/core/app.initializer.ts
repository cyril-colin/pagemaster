import { inject } from '@angular/core';
import { PageMasterSocketEvents } from '@pagemaster/common/socket-events.types';
import { catchError, EMPTY, Observable, switchMap, tap } from 'rxjs';
import { CurrentSessionState } from './current-session.state';
import { GameInstanceSocketService } from './game-instance-socket.service';
import { ResourcePacksStorage } from './resource-packs-storage.service';
import { SocketService } from './socket.service';

export const appInitializer: () => Observable<unknown> = () => {
  const socketService = inject(SocketService);
  socketService.connect();
  const gameInstanceSocket = inject(GameInstanceSocketService);
  gameInstanceSocket.init();
  const currentSession = inject(CurrentSessionState);
  const currentSessionInit = currentSession.init().pipe(
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

  return inject(ResourcePacksStorage).init().pipe(
    switchMap(() => currentSessionInit),
  );
};