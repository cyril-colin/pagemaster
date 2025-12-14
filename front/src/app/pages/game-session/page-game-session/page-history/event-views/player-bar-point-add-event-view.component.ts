import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EventPlayerBarPointAdd } from '@pagemaster/common/events-player.types';
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
  selector: 'app-player-bar-point-add-event-view',
  standalone: true,
  template: `
    @let e = event();
    @let p = player();
    @let b = bar();
    <event-layout [status]="'success'">
      <event-layout-icon [icon]="'heart'" [status]="'success'" />
      <event-layout-timestamp [timestamp]="e.event.timestamp" />
      <event-layout-content>
        <span>Gained <strong>{{ e.event.addedValue }}</strong> point(s)</span>
        @if(b) {
          <span>in <strong>{{ b.name }}</strong> ({{ b.current }} / {{ b.max }})</span>
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
    EventLayoutTimestampComponent,
    EventLayoutAvatarComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerBarPointAddEventViewComponent extends AbstractEventViewPlayerComponent<EventPlayerBarPointAdd> {
  protected bar = computed(() => {
    const bars = this.player()?.attributes.bar || [];
    return bars.find(b => b.id === this.event().event.barId);
  });
}
