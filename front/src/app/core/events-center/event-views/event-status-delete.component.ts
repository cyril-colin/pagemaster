
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EventPlayerStatusDelete } from '@pagemaster/common/events-player.types';
import { AbstractEventViewComponent } from './abstract-event-view.component';

@Component({
  selector: 'app-event-status-delete',
  template: `
    @let e = event();
    @let p = player();
    <span>Status deleted (ID: {{e.statusId}}) for </span>
    <a [routerLink]="playerUrl()"><img [src]="p?.avatar" /></a>
  `,
  styles: [
    `:host { img { width: 32px; height: 32px; } }`,
  ],
  imports: [RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventStatusDeleteComponent extends AbstractEventViewComponent<EventPlayerStatusDelete> {}