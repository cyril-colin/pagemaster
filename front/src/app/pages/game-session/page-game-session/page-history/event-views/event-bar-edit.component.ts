
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EventPlayerBarEdit } from '@pagemaster/common/events-player.types';
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
  selector: 'app-event-bar-edit',
  template: `
    @let e = event();
    @let p = player();
    <event-layout [status]="'info'">
      <event-layout-icon [icon]="'heart'" [status]="'info'" />
      <event-layout-timestamp [timestamp]="e.event.timestamp" />
      <event-layout-content>
        <span>Bar <strong>{{e.event.newBar.name}}</strong> edited</span>
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
export class EventBarEditComponent extends AbstractEventViewPlayerComponent<EventPlayerBarEdit> {}