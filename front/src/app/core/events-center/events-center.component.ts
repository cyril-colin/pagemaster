import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { EventsCenterStateService } from './events-center.state';

@Component({
  selector: 'app-events-center',
  template: `
  <section>
    @for(e of events(); track e.id) {
      <article>
        <p>{{ e.type }}</p>
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

}