import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { EventsCenterStateService } from './events-center.state';

@Component({
  selector: 'app-events-center',
  template: `
  <section>
    @for(e of events(); track e.id) {
      <article>
        <p>{{ formatTimestamp(e.timestamp) }} : {{ e.description }}</p>
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

  protected formatTimestamp(timestamp: number): string {
    return new Date(timestamp).toLocaleString();
  }

}