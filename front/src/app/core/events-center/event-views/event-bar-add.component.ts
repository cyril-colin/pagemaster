import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EventPlayerBarAdd } from '@pagemaster/common/events-player.types';
import { AbstractEventViewComponent } from './abstract-event-view.component';

@Component({
  selector: 'app-event-bar-add',
  template: 'New bar added: {{event().newBar}}',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventBarAddComponent extends AbstractEventViewComponent<EventPlayerBarAdd> {

}