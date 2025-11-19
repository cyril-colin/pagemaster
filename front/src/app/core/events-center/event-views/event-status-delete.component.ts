import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EventPlayerStatusDelete } from '@pagemaster/common/events-player.types';
import { AbstractEventViewComponent } from './abstract-event-view.component';

@Component({
  selector: 'app-event-status-delete',
  template: 'Status deleted: {{event().statusId}}',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventStatusDeleteComponent extends AbstractEventViewComponent<EventPlayerStatusDelete> {

}