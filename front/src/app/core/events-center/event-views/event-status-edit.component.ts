
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EventPlayerStatusEdit } from '@pagemaster/common/events-player.types';
import { AbstractEventViewPlayerComponent } from './abstract-event-view-player.component';

@Component({
  selector: 'app-event-status-edit',
  template: `
    @let e = event();
    @let p = player();
    <span>Status "{{e.event.newStatus.name}}" edited for </span>
    <a [routerLink]="playerUrl()"><img [src]="p?.avatar" /></a>
  `,
  styleUrls: ['./event-view-common.scss'],
  imports: [RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventStatusEditComponent extends AbstractEventViewPlayerComponent<EventPlayerStatusEdit> {}