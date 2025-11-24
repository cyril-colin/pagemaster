
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EventPlayerBarDelete } from '@pagemaster/common/events-player.types';
import { AbstractEventViewComponent } from './abstract-event-view.component';

@Component({
  selector: 'app-event-bar-delete',
  template: `
    @let e = event();
    @let p = player();
    <span>Bar deleted (ID: {{e.barId}}) for </span>
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
export class EventBarDeleteComponent extends AbstractEventViewComponent<EventPlayerBarDelete> {}