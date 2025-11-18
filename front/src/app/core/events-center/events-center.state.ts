import { Injectable, signal } from '@angular/core';
import { EventBase } from '@pagemaster/common/events.types';


@Injectable({
  providedIn: 'root',
})
export class EventsCenterStateService {
  private eventsSignal = signal<EventBase[]>([]);

  public readonly events = this.eventsSignal.asReadonly();

  public addEvent(event: EventBase): void {
    this.eventsSignal.update((events) => [...events, event]);
  }

  public clearEvents(): void {
    this.eventsSignal.set([]);
  }
}