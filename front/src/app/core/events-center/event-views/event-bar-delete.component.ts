import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EventPlayerBarDelete } from '@pagemaster/common/events-player.types';
import { AbstractEventViewComponent } from './abstract-event-view.component';

@Component({
  selector: 'app-event-bar-delete',
  template: 'Bar deleted: {{event().barId}}',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventBarDeleteComponent extends AbstractEventViewComponent<EventPlayerBarDelete> {

}