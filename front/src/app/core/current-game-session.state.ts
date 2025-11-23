import { computed, inject, Injectable, signal } from '@angular/core';
import { GameSession } from '@pagemaster/common/pagemaster.types';
import { Observable, of, tap } from 'rxjs';
import { CURRENT_GAME_SESSION_CACHE_KEY, LocalStorageService } from './local-storage.service';
import { GameSessionRepository } from './repositories/game-session.repository';

@Injectable({
  providedIn: 'root',
})
export class CurrentGameSessionState {
  protected localStorageService = inject(LocalStorageService);
  protected gameInstanceService = inject(GameSessionRepository);
  
  private readonly currentGameInstanceSignal = signal<GameSession | null>(null);
  
  public readonly currentGameSessionNullable = this.currentGameInstanceSignal.asReadonly();
  public readonly currentGameSession = computed(() => {
    return this.currentGameSessionNullable()!;
  });

  public init(): Observable<GameSession | null> {
    const cachedInstance = this.localStorageService.getItem<GameSession>(CURRENT_GAME_SESSION_CACHE_KEY);
    if (!cachedInstance) {
      this.currentGameInstanceSignal.set(null);
      this.localStorageService.removeItem(CURRENT_GAME_SESSION_CACHE_KEY);
      return of(null);
    }

    return this.setCurrentGameSession(cachedInstance);
  }

  public setCurrentGameSession(newInstance: GameSession, mode: 'fetch' | 'fast' = 'fetch') {
    const update = (instance: GameSession) => {
      if (!instance) {
        this.currentGameInstanceSignal.set(null);
        this.localStorageService.removeItem(CURRENT_GAME_SESSION_CACHE_KEY);
        return null;
      }
      this.localStorageService.setItem<GameSession>(CURRENT_GAME_SESSION_CACHE_KEY, instance);
      this.currentGameInstanceSignal.set(instance);
      
      return instance;
    };

    if (mode === 'fast') {
      update(newInstance);
      return of(newInstance);
    }

    return this.gameInstanceService.getGameSessionById(newInstance.id).pipe(
      tap(instance => update(instance)),
    );
  }

  public clearCurrentGameSession() {
    this.currentGameInstanceSignal.set(null);
    this.localStorageService.removeItem(CURRENT_GAME_SESSION_CACHE_KEY);
  }
}