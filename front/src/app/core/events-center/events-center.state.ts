import { inject, Injectable, signal } from '@angular/core';
import { EventBase } from '@pagemaster/common/events.types';
import { tap } from 'rxjs';
import { CurrentGameSessionState } from '../current-game-session.state';
import { GameEventRepository } from '../repositories/game-event.repository';


export type EventMeta<T extends EventBase = EventBase> = {
  isNew: boolean,
  event: T,
};

@Injectable({
  providedIn: 'root',
})
export class EventsCenterStateService {
  private eventsSignal = signal<EventMeta[]>([]);
  private gameEventRepository = inject(GameEventRepository);
  private currentGameSessionState = inject(CurrentGameSessionState);

  public readonly events = this.eventsSignal.asReadonly();

  /**
   * Used in route guards to preload events before activating the route.
   */
  public init() {
    const gameSessionId = this.currentGameSessionState.currentGameSession().id;
    return this.gameEventRepository.getAll(gameSessionId).pipe(
      tap((events) => {
        this.eventsSignal.set(events.sort((a, b) => b.timestamp - a.timestamp).map(e => ({ isNew: false, event: e })));
      }),
    );
  }

  public addEvent(event: EventBase): void {
    this.eventsSignal.update((events) => {
      // Check if event already exists (for updates like loot box claims)
      const existingIndex = events.findIndex(e => e.event.id === event.id);
      if (existingIndex !== -1) {
        // Update existing event
        const updated = [...events];
        updated[existingIndex].isNew = false;
        updated[existingIndex] = { ...updated[existingIndex], event };
        return updated;
      }
      // Add new event
      return [{ isNew: true, event }, ...events];
    });
  }

  public setSeen(eventIds: string[]): void {
    this.eventsSignal.update((events) =>
      events.map((e) =>
        eventIds.includes(e.event.id) ? { ...e, isNew: false } : e,
      ),
    );
  }

  public clearEvents(): void {
    this.eventsSignal.set([]);
  }
}