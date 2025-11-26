
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EventPlayerAvatarEdit } from '@pagemaster/common/events-player.types';
import { AbstractEventViewPlayerComponent } from './abstract-event-view-player.component';

@Component({
  selector: 'app-event-avatar-edit',
  template: `
    @let e = event();
    @let p = player();
    <img [src]="e.newAvatar" />
    avatar updated for
    <a [routerLink]="playerUrl()"><img [src]="p?.avatar" /></a>
  `,
  styleUrls: ['./event-view-common.scss'],
  imports: [RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventAvatarEditComponent extends AbstractEventViewPlayerComponent<EventPlayerAvatarEdit> {}