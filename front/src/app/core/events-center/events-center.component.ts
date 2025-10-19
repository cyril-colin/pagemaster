import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { EventMessage, EventsCenterStateService } from './events-center.state';

@Component({
  selector: 'app-events-center',
  template: `
  <section>
    @for(e of events(); track e.message) {
      <article>{{ e.message }} <button (click)="removeEvent(e)">Remove</button></article>
    }
  </section>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventsCenterComponent {
  protected eventsCenterState = inject(EventsCenterStateService);
  protected events = this.eventsCenterState.events;

  protected removeEvent(event: EventMessage) {
    this.eventsCenterState.removeEvent(event);
  }

}