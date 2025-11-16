import { computed, inject, Injectable } from '@angular/core';
import { PageMasterSocketEvents } from '@pagemaster/common/socket-events.types';
import { map, tap } from 'rxjs';
import { CurrentGameSessionState } from './current-game-session.state';
import { CurrentParticipantState } from './current-participant.state';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root',
})
export class CurrentSessionState {
  protected currentGameState = inject(CurrentGameSessionState);
  protected currentParticipantState = inject(CurrentParticipantState);
  private currentParticipant = computed(() => {
    const participants = this.currentGameState.currentGameSession()?.participants || [];
    const currentParticipantId = this.currentParticipantState.currentParticipant();
    const currentParticipant = participants.find(p => p.id === currentParticipantId);
    if (!currentParticipant) {
      throw new Error(`No participant with id <${currentParticipantId}>`
        +` found in GameSession <${this.currentGameState.currentGameSession()?.id}>`);
    }
    return currentParticipant;
  });
  protected socketService = inject(SocketService);
  
  public currentSession = computed(() => {
    const gameSession = this.currentGameState.currentGameSession();
    const participant = this.currentParticipant();
    if (!gameSession || !participant) {
      throw new Error('No current session available');
    }

    return { gameSession, participant };
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
      tap(gameSession => {
        if (!gameSession) {
          throw new Error('No current game instance set');
        }
        return this.currentParticipantState.init(gameSession);
      }),
      map(() => this.currentSession()),
    );
  }

  

  public logout() {
    const currentGameSession = this.currentGameState.currentGameSession();
    this.currentGameState.clearCurrentGameSession();
    this.currentParticipantState.clearParticipant();
    this.socketService.emit(PageMasterSocketEvents.LEAVE_GAME_SESSION, { gameSessionId: currentGameSession?.id || 'unknown' });
  }
}