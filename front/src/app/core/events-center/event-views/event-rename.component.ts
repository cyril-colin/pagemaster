
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EventPlayerNameEdit } from '@pagemaster/common/events-player.types';
import { AbstractEventViewComponent } from './abstract-event-view.component';

@Component({
  selector: 'app-event-rename',
  template: `
    @let e = event();
    @let p = player();
    <span>Player renamed to "{{e.newName}}" </span>
    <a [routerLink]="playerUrl()"><img [src]="p?.avatar" /></a>
  `,
  styles: [
    `:host { img { width: 32px; height: 32px; } }`,
  ],
  imports: [RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventRenameComponent extends AbstractEventViewComponent<EventPlayerNameEdit> {}