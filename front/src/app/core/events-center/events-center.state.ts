import { inject, Injectable, signal } from '@angular/core';
import { EventBase } from '@pagemaster/common/events.types';
import { tap } from 'rxjs';
import { GameEventRepository } from '../repositories/game-event.repository';


@Injectable({
  providedIn: 'root',
})
export class EventsCenterStateService {
  private eventsSignal = signal<EventBase[]>([]);
  private gameEventRepository = inject(GameEventRepository);

  public readonly events = this.eventsSignal.asReadonly();

  /**
   * Used in route guards to preload events before activating the route.
   */
  public init() {
    return this.gameEventRepository.getAll().pipe(
      tap((events) => {
        this.eventsSignal.set(events);
      }),
    );
  }

  public addEvent(event: EventBase): void {
    this.eventsSignal.update((events) => [...events, event]);
  }

  public clearEvents(): void {
    this.eventsSignal.set([]);
  }
}