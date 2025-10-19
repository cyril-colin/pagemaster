import { inject, Injectable, signal } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { GameInstance } from '../../pagemaster-schemas/src/pagemaster.types';
import { CURRENT_GAME_INSTANCE_CACHE_KEY, LocalStorageService } from './local-storage.service';
import { GameInstanceService } from './repositories/game-instance.service';

@Injectable({
  providedIn: 'root',
})
export class CurrentGameInstanceState {
  protected localStorageService = inject(LocalStorageService);
  protected gameInstanceService = inject(GameInstanceService);
  
  private readonly currentGameInstanceSignal = signal<GameInstance | null>(null);
  public readonly currentGameInstance = this.currentGameInstanceSignal.asReadonly();

  init(): Observable<GameInstance | null> {
    const cachedInstance = this.localStorageService.getItem<GameInstance>(CURRENT_GAME_INSTANCE_CACHE_KEY);
    if (!cachedInstance) {
      this.currentGameInstanceSignal.set(null);
      this.localStorageService.removeItem(CURRENT_GAME_INSTANCE_CACHE_KEY);
      return of(null);
    }

    return this.setCurrentGameInstance(cachedInstance);
  }

  public setCurrentGameInstance(newInstance: GameInstance, mode: 'fetch' | 'fast' = 'fetch') {
    const update = (instance: GameInstance) => {
      if (!instance) {
        this.currentGameInstanceSignal.set(null);
        this.localStorageService.removeItem(CURRENT_GAME_INSTANCE_CACHE_KEY);
        return null;
      }
      this.localStorageService.setItem<GameInstance>(CURRENT_GAME_INSTANCE_CACHE_KEY, instance);
      this.currentGameInstanceSignal.set(instance);
      
      return instance;
    };

    if (mode === 'fast') {
      update(newInstance);
      return of(newInstance);
    }

    return this.gameInstanceService.getGameInstanceById(newInstance.id).pipe(
      tap(instance => update(instance)),
    );
  }

  public clearCurrentGameInstance() {
    this.currentGameInstanceSignal.set(null);
    this.localStorageService.removeItem(CURRENT_GAME_INSTANCE_CACHE_KEY);
  }
}