import { inject, Injectable, signal } from '@angular/core';
import { GameEvent } from '@pagemaster/common/pagemaster.types';
import { map, Observable, tap } from 'rxjs';
import { GameEventService } from '../repositories/game-event.service';


export type EventMessage = {
  type: 'info' | 'warning' | 'error',
  /**
   * Time to live in seconds
   * 0 means infinite
   */
  ttl: number,
  message: string,
  timestamp: Date,
};
@Injectable({
  providedIn: 'root',
})
export class EventsCenterStateService {
  private gameEventService = inject(GameEventService);
  private eventsSignal = signal<EventMessage[]>([]);
  private gameInstanceIdSignal = signal<string | null>(null);

  public readonly events = this.eventsSignal.asReadonly();

  public addEvent(event: EventMessage): void {
    event.ttl = 0; // tmp disable ttl
    this.eventsSignal.update((events) => [...events, event]);
    if (event.ttl > 0) {
      this.listenTTL(event);
    }
  }

  public init(gameEventid: string): Observable<void> {
    return this.gameEventService.getGameEventsByGameInstanceId(gameEventid).pipe(
      tap((gameEvents) => {
        gameEvents.forEach((gameEvent) => {
          const eventMessage = this.convertGameEventToEventMessage(gameEvent);
          this.addEvent(eventMessage);
        });
      }),
      map(() => void 0),
    );
  }

  private convertGameEventToEventMessage(gameEvent: GameEvent): EventMessage {
    return {
      type: 'info', // Map game event types to message types, can be enhanced based on gameEvent.type
      ttl: 0,
      message: `${gameEvent.title}: ${gameEvent.description}`,
      timestamp: new Date(gameEvent.timestamp),
    };
  }

  public clearEvents(): void {
    this.eventsSignal.set([]);
  }
  public removeEvent(event: EventMessage): void {
    this.eventsSignal.update(events => events.filter(e => e !== event));
  }

  private listenTTL(event: EventMessage): void {
    setTimeout(() => {
      this.removeEvent(event);
    }, event.ttl * 1000);
  }

}