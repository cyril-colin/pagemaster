
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EventPlayerStatusDelete } from '@pagemaster/common/events-player.types';
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
  selector: 'app-event-status-delete',
  template: `
    @let e = event();
    @let p = player();
    <event-layout [status]="'danger'">
      <event-layout-icon [icon]="'shield'" [status]="'danger'" />
      <event-layout-timestamp [timestamp]="e.event.timestamp" />
      <event-layout-content>
        @if (e.event.statusIds.length === 1) {
          <span>Status deleted</span>
        } @else {
          <span><strong>{{e.event.statusIds.length}}</strong> statuses deleted</span>
        }
      </event-layout-content>
      <event-layout-avatar>
        <a [routerLink]="playerUrl()"><ds-image [size]="'m'" [src]="p?.avatar || ''" /></a>
      </event-layout-avatar>
    </event-layout>
  `,
  styleUrls: ['./event-view-common.scss'],
  imports: [
    RouterModule,
    ImageComponent,
    EventLayoutComponent,
    EventLayoutIconComponent,
    EventLayoutContentComponent,
    EventLayoutAvatarComponent,
    EventLayoutTimestampComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventStatusDeleteComponent extends AbstractEventViewPlayerComponent<EventPlayerStatusDelete> {}