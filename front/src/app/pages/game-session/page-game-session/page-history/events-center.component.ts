import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { EventsCenterStateService } from '../../../../core/events-center/events-center.state';
import { EventFactoryDirective } from './event-factory.directive';

@Component({
  selector: 'app-events-center',
  template: `
  <section class="events-list">
    @for(e of events(); track e.event.id) {
      <ng-container appEventFactory [event]="e">
      </ng-container>
    }
  </section>
  `,
  styles: [`
    :host {
      display: flex;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    
    .events-list {
      display: flex;
      flex-direction: column;
      gap: var(--gap-medium);
      width: 100%;
      height: 100%;
      overflow-y: auto;
      background: var(--color-background-main);
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