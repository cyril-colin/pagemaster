import { inject, Injectable, signal } from '@angular/core';
import { EventBase } from '@pagemaster/common/events.types';
import { tap } from 'rxjs';
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

  public readonly events = this.eventsSignal.asReadonly();

  /**
   * Used in route guards to preload events before activating the route.
   */
  public init() {
    return this.gameEventRepository.getAll().pipe(
      tap((events) => {
        this.eventsSignal.set(events.sort((a, b) => b.timestamp - a.timestamp).map(e => ({ isNew: false, event: e })));
      }),
    );
  }

  public addEvent(event: EventBase): void {
    this.eventsSignal.update((events) => [{ isNew: true, event }, ...events]);
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