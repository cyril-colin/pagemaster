import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, tap } from 'rxjs';
import { PageMasterSocketEvents } from '@pagemaster/common/socket-events.types';
import { CurrentGameInstanceState } from './current-game-instance.state';
import { CurrentSessionState } from './current-session.state';
import { EventsCenterStateService } from './events-center/events-center.state';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root',
})
export class GameInstanceSocketService {
  protected socketService = inject(SocketService);
  protected currentGameState = inject(CurrentGameInstanceState);
  protected currentSessionState = inject(CurrentSessionState);
  protected eventsCenterState = inject(EventsCenterStateService);
  public init() {
    toSignal(this.socketService.listen(PageMasterSocketEvents.GAME_INSTANCE_UPDATED).pipe(
      tap(({gameInstance, by}) => {
        
        const itsMe = this.currentSessionState.currentSession().participant.id === by.id;
        let message = '';
        if (itsMe) {
          message = `You updated game instance: ${gameInstance.id}`;
        } else {
          message = `${by.type === 'gameMaster' ? 'Game Master' : by.character.name} updated game instance: ${gameInstance.id}`;
        }
        this.eventsCenterState.addEvent({
          type: 'info',
          ttl: 5,
          message: message,
          timestamp: new Date(),
        });
      }),
      switchMap(({gameInstance}) => this.currentGameState.setCurrentGameInstance(gameInstance, 'fast')),
    ));
  }
}