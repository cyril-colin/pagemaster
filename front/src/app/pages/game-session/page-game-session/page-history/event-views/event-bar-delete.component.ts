
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EventPlayerBarDelete } from '@pagemaster/common/events-player.types';
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
  selector: 'app-event-bar-delete',
  template: `
    @let e = event();
    @let p = player();
    <event-layout [status]="'danger'">
      <event-layout-icon [icon]="'heart'" [status]="'danger'" />
      <event-layout-timestamp [timestamp]="e.event.timestamp" />
      <event-layout-content>
        @if (e.event.barIds.length === 1) {
          <span>Bar deleted</span>
        } @else {
          <span><strong>{{e.event.barIds.length}}</strong> bars deleted</span>
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
export class EventBarDeleteComponent extends AbstractEventViewPlayerComponent<EventPlayerBarDelete> {}