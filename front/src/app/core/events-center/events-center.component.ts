import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { GameEvent } from '@pagemaster/common/pagemaster.types';
import { EventsCenterStateService } from './events-center.state';

@Component({
  selector: 'app-events-center',
  template: `
  <section>
    @for(e of events(); track e.id) {
      <article>
        <strong>{{ e.title }}</strong>
        <p>{{ e.description }}</p>
        <small>{{ e.participantName }} - {{ formatTimestamp(e.timestamp) }}</small>
        <button (click)="removeEvent(e)">Remove</button>
      </article>
    }
  </section>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventsCenterComponent {
  protected eventsCenterState = inject(EventsCenterStateService);
  protected events = this.eventsCenterState.events;

  protected removeEvent(event: GameEvent) {
    this.eventsCenterState.removeEvent(event);
  }

  protected formatTimestamp(timestamp: number): string {
    return new Date(timestamp).toLocaleString();
  }

}