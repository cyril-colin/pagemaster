
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EventPlayerStatusAdd } from '@pagemaster/common/events-player.types';
import { ImageComponent } from '../../../../../core/design-system/image.component';
import { AbstractEventViewPlayerComponent } from './abstract-event-view-player.component';

@Component({
  selector: 'app-event-status-add',
  template: `
    @let e = event();
    @let p = player();
    <span>
      @if (e.event.newStatuses.length === 1) {
        Status "{{e.event.newStatuses[0].name}}" added to
      } @else {
        {{e.event.newStatuses.length}} statuses added to
      }
    </span>
    <a [routerLink]="playerUrl()"><ds-image [src]="p?.avatar || ''" /></a>
  `,
  styleUrls: ['./event-view-common.scss'],
  imports: [RouterModule, ImageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventStatusAddComponent extends AbstractEventViewPlayerComponent<EventPlayerStatusAdd> {}