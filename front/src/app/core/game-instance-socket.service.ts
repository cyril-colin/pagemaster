import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { GameEvent } from '@pagemaster/common/pagemaster.types';
import { PageMasterSocketEvents } from '@pagemaster/common/socket-events.types';
import { switchMap, tap } from 'rxjs';
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
        
        const gameEvent: GameEvent = {
          id: `${Date.now()}-${by.id}`,
          gameInstanceId: gameInstance.id,
          type: 'game-instance-update',
          participantId: by.id,
          participantName: by.type === 'gameMaster' ? by.name : by.character.name,
          title: 'Game Instance Updated',
          description: message,
          timestamp: Date.now(),
        };
        
        this.eventsCenterState.addEvent(gameEvent);
      }),
      switchMap(({gameInstance}) => this.currentGameState.setCurrentGameInstance(gameInstance, 'fast')),
    ));
  }
}