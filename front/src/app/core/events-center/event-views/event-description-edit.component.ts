import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EventPlayerDescriptionEdit } from '@pagemaster/common/events-player.types';
import { AbstractEventViewComponent } from './abstract-event-view.component';

@Component({
  selector: 'app-event-description-edit',
  template: 'New description: {{event().newDescription}}',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventDescriptionEditComponent extends AbstractEventViewComponent<EventPlayerDescriptionEdit> {

}