import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EventPlayerStatusAdd } from '@pagemaster/common/events-player.types';
import { AbstractEventViewComponent } from './abstract-event-view.component';

@Component({
  selector: 'app-event-status-add',
  template: 'New status added: {{event().newStatus}}',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventStatusAddComponent extends AbstractEventViewComponent<EventPlayerStatusAdd> {

}