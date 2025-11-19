import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EventPlayerAvatarEdit } from '@pagemaster/common/events-player.types';
import { AbstractEventViewComponent } from './abstract-event-view.component';

@Component({
  selector: 'app-event-avatar-edit',
  template: 'New avatar: {{event().newAvatar}}',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventAvatarEditComponent extends AbstractEventViewComponent<EventPlayerAvatarEdit> {

}