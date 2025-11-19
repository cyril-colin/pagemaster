import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EventPlayerNameEdit } from '@pagemaster/common/events-player.types';
import { AbstractEventViewComponent } from './abstract-event-view.component';

@Component({
  selector: 'app-event-rename',
  template: 'New name : {{event().newName }}',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventRenameComponent extends AbstractEventViewComponent<EventPlayerNameEdit> {

}