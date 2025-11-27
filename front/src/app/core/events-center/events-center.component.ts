import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { EventFactoryDirective } from './event-factory.directive';
import { EventsCenterStateService } from './events-center.state';

@Component({
  selector: 'app-events-center',
  template: `
  <section>
    @for(e of events(); track e.event.id) {
      <article appEventFactory [event]="e">
      </article>
    }
  </section>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      gap: 16px;
      width: 100%;
      height: 100%;
      section {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 4px;
        overflow-y: auto;
        padding-right: 8px;
        width: 100%;
        height: 100%;
        article {

        }
      }
    }
    `],
  imports: [
    EventFactoryDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventsCenterComponent {
  protected eventsCenterState = inject(EventsCenterStateService);
  protected events = this.eventsCenterState.events;

}