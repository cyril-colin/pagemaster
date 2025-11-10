import { computed, inject, Injectable } from '@angular/core';
import { PageMasterSocketEvents } from '@pagemaster/common/socket-events.types';
import { map, tap } from 'rxjs';
import { CurrentGameInstanceState } from './current-game-instance.state';
import { CurrentParticipantState } from './current-participant.state';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root',
})
export class CurrentSessionState {
  protected currentGameState = inject(CurrentGameInstanceState);
  protected currentParticipantState = inject(CurrentParticipantState);
  private currentParticipant = computed(() => {
    const participants = this.currentGameState.currentGameInstance()?.participants || [];
    const currentParticipantId = this.currentParticipantState.currentParticipant();
    const currentParticipant = participants.find(p => p.id === currentParticipantId);
    if (!currentParticipant) {
      throw new Error(`No participant with id <${currentParticipantId}>`
        +` found in GameInstance <${this.currentGameState.currentGameInstance()?.id}>`);
    }
    return currentParticipant;
  });
  protected socketService = inject(SocketService);
  
  public currentSession = computed(() => {
    const gameInstance = this.currentGameState.currentGameInstance();
    const participant = this.currentParticipant();
    if (!gameInstance || !participant) {
      throw new Error('No current session available');
    }

    return { gameInstance, participant };
  });

  public currentSessionNullable = computed(() => {
    try {
      return this.currentSession();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch(_) {
      return null;
    }
  });

  public allowedToEditCharacterSnapshot() {
    const currentParticipant = this.currentParticipant();
    return currentParticipant.type === 'gameMaster';
  }

  public allowedToEditCharacter = () => computed(() => {
    return this.allowedToEditCharacterSnapshot();
  });

  public init() {
    return this.currentGameState.init().pipe(
      tap(gameInstance => {
        if (!gameInstance) {
          throw new Error('No current game instance set');
        }
        return this.currentParticipantState.init(gameInstance);
      }),
      map(() => this.currentSession()),
    );
  }

  

  public logout() {
    const currentGameInstance = this.currentGameState.currentGameInstance();
    this.currentGameState.clearCurrentGameInstance();
    this.currentParticipantState.clearParticipant();
    this.socketService.emit(PageMasterSocketEvents.LEAVE_GAME_INSTANCE, { gameInstanceId: currentGameInstance?.id || 'unknown' });
  }
}