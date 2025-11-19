import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { EventFactoryDirective } from './event-factory.directive';
import { EventsCenterStateService } from './events-center.state';

@Component({
  selector: 'app-events-center',
  template: `
  <section>
    @for(e of events(); track e.id) {
      <article appEventFactory [event]="e">
      </article>
    }
  </section>
  `,
  styles: [],
  imports: [
    EventFactoryDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventsCenterComponent {
  protected eventsCenterState = inject(EventsCenterStateService);
  protected events = this.eventsCenterState.events;

}