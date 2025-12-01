
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EventPlayerAvatarEdit } from '@pagemaster/common/events-player.types';
import { ImageComponent } from '../../../../../core/design-system/image.component';
import { AbstractEventViewPlayerComponent } from './abstract-event-view-player.component';

@Component({
  selector: 'app-event-avatar-edit',
  template: `
    @let e = event();
    @let p = player();
    
    {{p?.name}} changed avatar to
    <a [routerLink]="playerUrl()"><ds-image [src]="e.event.newAvatar" /></a>
  `,
  styleUrls: ['./event-view-common.scss'],
  imports: [RouterModule, ImageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventAvatarEditComponent extends AbstractEventViewPlayerComponent<EventPlayerAvatarEdit> {}