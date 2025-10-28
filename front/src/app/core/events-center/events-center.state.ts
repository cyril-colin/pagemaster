import { computed, inject, Injectable, signal } from '@angular/core';
import { GameEvent } from '@pagemaster/common/pagemaster.types';
import { map, Observable, tap } from 'rxjs';
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

  public init(gameEventid: string): Observable<void> {
    return this.gameEventService.getGameEventsByGameInstanceId(gameEventid).pipe(
      tap((gameEvents) => {
        gameEvents.forEach((gameEvent) => {
          this.addEvent(gameEvent);
        });
      }),
      map(() => void 0),
    );
  }

  public clearEvents(): void {
    this.eventsSignal.set([]);
  }
  
  public removeEvent(event: GameEvent): void {
    this.eventsSignal.update(events => events.filter(e => e.id !== event.id));
  }

}