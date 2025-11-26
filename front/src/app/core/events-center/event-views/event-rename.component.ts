
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EventPlayerNameEdit } from '@pagemaster/common/events-player.types';
import { AbstractEventViewPlayerComponent } from './abstract-event-view-player.component';

@Component({
  selector: 'app-event-rename',
  template: `
    @let e = event();
    @let p = player();
    <span>Player renamed to "{{e.newName}}" </span>
    <a [routerLink]="playerUrl()"><img [src]="p?.avatar" /></a>
  `,
  styleUrls: ['./event-view-common.scss'],
  imports: [RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventRenameComponent extends AbstractEventViewPlayerComponent<EventPlayerNameEdit> {}