
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EventPlayerDescriptionEdit } from '@pagemaster/common/events-player.types';
import { AbstractEventViewComponent } from './abstract-event-view.component';

@Component({
  selector: 'app-event-description-edit',
  template: `
    @let p = player();
    <span>Description updated for </span>
    <a [routerLink]="playerUrl()"><img [src]="p?.avatar" /></a>
  `,
  styles: [
    `:host { 
      img {
        width: 32px;
        height: 32px; 
      }
    }`,
  ],
  imports: [RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventDescriptionEditComponent extends AbstractEventViewComponent<EventPlayerDescriptionEdit> {}