
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EventPlayerStatusAdd } from '@pagemaster/common/events-player.types';
import { AbstractEventViewComponent } from './abstract-event-view.component';

@Component({
  selector: 'app-event-status-add',
  template: `
    @let e = event();
    @let p = player();
    <span>Status "{{e.newStatus.name}}" added to </span>
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
export class EventStatusAddComponent extends AbstractEventViewComponent<EventPlayerStatusAdd> {}