import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { GameEvent } from '@pagemaster/common/pagemaster.types';
import { PageMasterSocketEvents } from '@pagemaster/common/socket-events.types';
import { switchMap, tap } from 'rxjs';
import { CurrentGameSessionState } from './current-game-session.state';
import { CurrentSessionState } from './current-session.state';
import { EventsCenterStateService } from './events-center/events-center.state';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root',
})
export class GameSessionSocketService {
  protected socketService = inject(SocketService);
  protected currentGameState = inject(CurrentGameSessionState);
  protected currentSessionState = inject(CurrentSessionState);
  protected eventsCenterState = inject(EventsCenterStateService);
  public init() {
    toSignal(this.socketService.listen(PageMasterSocketEvents.GAME_SESSION_UPDATED).pipe(
      tap((payload) => {
        this.eventsCenterState.addEvent(payload.event as GameEvent);
      }),
      switchMap((payload) => this.currentGameState.setCurrentGameSession(payload.gameSession, 'fast')),
    ));
  }
}