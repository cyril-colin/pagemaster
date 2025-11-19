import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EventPlayerBarEdit } from '@pagemaster/common/events-player.types';
import { AbstractEventViewComponent } from './abstract-event-view.component';

@Component({
  selector: 'app-event-bar-edit',
  template: 'Bar edited: {{event().newBar}}',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventBarEditComponent extends AbstractEventViewComponent<EventPlayerBarEdit> {

}