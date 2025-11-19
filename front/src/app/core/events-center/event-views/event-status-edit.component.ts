import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EventPlayerStatusEdit } from '@pagemaster/common/events-player.types';
import { AbstractEventViewComponent } from './abstract-event-view.component';

@Component({
  selector: 'app-event-status-edit',
  template: 'Status edited: {{event().newStatus}}',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventStatusEditComponent extends AbstractEventViewComponent<EventPlayerStatusEdit> {

}