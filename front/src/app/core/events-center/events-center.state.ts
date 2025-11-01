import { computed, inject, Injectable, signal } from '@angular/core';
import { GameEvent } from '@pagemaster/common/pagemaster.types';
import { Observable, tap } from 'rxjs';
import { GameEventRepository } from '../repositories/game-event.repository';


@Injectable({
  providedIn: 'root',
})
export class EventsCenterStateService {
  private gameEventService = inject(GameEventRepository);
  private eventsSignal = signal<GameEvent[]>([]);

  public readonly events = computed(() => {
    const events = this.eventsSignal.asReadonly();
    return events().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  });

  public addEvent(event: GameEvent): void {
    this.eventsSignal.update((events) => [...events, event]);
  }

  public init(gameInstanceId: string): Observable<GameEvent[]> {
    return this.gameEventService.getGameEventsByGameInstanceId(gameInstanceId).pipe(
      tap((gameEvents) => {
        this.eventsSignal.set(gameEvents);
      }),
    );
  }
}