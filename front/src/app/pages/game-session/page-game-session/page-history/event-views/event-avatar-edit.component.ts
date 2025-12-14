
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EventPlayerAvatarEdit } from '@pagemaster/common/events-player.types';
import { ImageComponent } from '../../../../../core/design-system/image.component';
import { AbstractEventViewPlayerComponent } from './abstract-event-view-player.component';
import {
  EventLayoutAvatarComponent,
  EventLayoutComponent,
  EventLayoutContentComponent,
  EventLayoutIconComponent,
  EventLayoutTimestampComponent,
} from './event-layout.component';

@Component({
  selector: 'app-event-avatar-edit',
  template: `
    @let e = event();
    @let p = player();
    <event-layout [status]="'info'">
      <event-layout-icon [icon]="'user'" [status]="'info'" />
      <event-layout-timestamp [timestamp]="e.event.timestamp" />
      <event-layout-content>
        <span><strong>{{p?.name}}</strong> changed avatar</span>
      </event-layout-content>
      <event-layout-avatar>
        <a [routerLink]="playerUrl()"><ds-image [size]="'m'" [src]="e.event.newAvatar" /></a>
      </event-layout-avatar>
    </event-layout>
  `,
  styleUrls: ['./event-view-common.scss'],
  imports: [
    RouterModule,
    ImageComponent,
    EventLayoutComponent,
    EventLayoutIconComponent,
    EventLayoutContentComponent, EventLayoutTimestampComponent,
    EventLayoutAvatarComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventAvatarEditComponent extends AbstractEventViewPlayerComponent<EventPlayerAvatarEdit> {}