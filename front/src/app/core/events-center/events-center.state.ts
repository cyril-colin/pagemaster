import { Injectable, signal } from '@angular/core';


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
  private eventsSignal = signal<EventMessage[]>([]);
  public readonly events = this.eventsSignal.asReadonly();

  public addEvent(event: EventMessage): void {
    event.ttl = 0; // tmp disable ttl
    this.eventsSignal.update((events) => [...events, event]);
    if (event.ttl > 0) {
      this.listenTTL(event);
    }
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