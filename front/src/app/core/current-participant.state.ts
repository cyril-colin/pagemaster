import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { GameSession, ParticipantType } from '@pagemaster/common/pagemaster.types';
import { PageMasterSocketEvents } from '@pagemaster/common/socket-events.types';
import { CurrentGameSessionState } from './current-game-session.state';
import { CURRENT_PARTICIPANT_CACHE_KEY, CURRENT_PARTICIPANT_TTL, LocalStorageService } from './local-storage.service';
import { PageMasterRoutes } from './pagemaster.router';
import { SocketService } from './socket.service';


@Injectable({
  providedIn: 'root',
})
export class CurrentParticipantState {
  private router = inject(Router);
  private localStorageService = inject(LocalStorageService);
  private currentParticipantSignal = signal<string | null>(null);
  public currentParticipantId = this.currentParticipantSignal.asReadonly();
  private currentGameSessionState = inject(CurrentGameSessionState);
  protected socketService = inject(SocketService);
  public currentParticipant = computed(() => {
    const gameSession = this.currentGameSessionState.currentGameSessionNullable();
    const participantId = this.currentParticipantSignal();
    if (!gameSession || !participantId) {
      return null;
    }
    if (gameSession.master.id === participantId) {
      return gameSession.master;
    }
    return gameSession.players.find(p => p.id === participantId) || null;
  });
  
  init(gameSession: GameSession){
    const cachedParticipant = this.localStorageService.getItem<string>(CURRENT_PARTICIPANT_CACHE_KEY);
    if (!cachedParticipant) {
      return;
    }

    const existingParticipant = cachedParticipant === ParticipantType.GameMaster ?
      gameSession.master :
      gameSession.players.find(p => p.id === cachedParticipant);
    if (!existingParticipant) {
      this.currentParticipantSignal.set(null);
      this.localStorageService.removeItem(CURRENT_PARTICIPANT_CACHE_KEY);
      console.warn('Cached participant not found in game instance, clearing cache');
      return;
    }

    this.localStorageService.setItem<string>(CURRENT_PARTICIPANT_CACHE_KEY, existingParticipant.id, CURRENT_PARTICIPANT_TTL);
    this.currentParticipantSignal.set(existingParticipant.id);
  }

  setParticipant(participant: string): void {
    this.currentParticipantSignal.set(participant);
    this.localStorageService.setItem<string>(CURRENT_PARTICIPANT_CACHE_KEY, participant, CURRENT_PARTICIPANT_TTL);
  }

  clearParticipant(): void {
    this.currentParticipantSignal.set(null);
    this.localStorageService.removeItem(CURRENT_PARTICIPANT_CACHE_KEY);
    void this.router.navigate(['', ...PageMasterRoutes().Home.path.split('/')]);
  }


  public logout() {
    this.currentGameSessionState.clearCurrentGameSession();
    this.clearParticipant();
    this.socketService.emit(PageMasterSocketEvents.LEAVE_GAME_SESSION, {
      gameSessionId: this.currentGameSessionState.currentGameSession()?.id || 'unknown',
    });
  }

  
  public allowedToEditPlayerSnapshot() {
    const currentParticipant = this.currentParticipant();
    return currentParticipant?.type === ParticipantType.GameMaster;
  }

  public allowedToEditPlayer = () => computed(() => {
    return this.allowedToEditPlayerSnapshot();
  });
}