
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EventPlayerAvatarEdit } from '@pagemaster/common/events-player.types';
import { AbstractEventViewComponent } from './abstract-event-view.component';

@Component({
  selector: 'app-event-avatar-edit',
  template: `
    @let e = event();
    @let p = player();
    <img [src]="e.newAvatar" />
    avatar updated for
    <a [routerLink]="playerUrl()"><img [src]="p?.avatar" /></a>
  `,
  styles: [
    `:host {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      img {
        border-radius: 50%;
        width: 32px;
        height: 32px;
      }
     }`,
  ],
  imports: [RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventAvatarEditComponent extends AbstractEventViewComponent<EventPlayerAvatarEdit> {}