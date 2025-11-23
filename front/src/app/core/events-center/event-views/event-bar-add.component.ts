
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EventPlayerBarAdd } from '@pagemaster/common/events-player.types';
import { AbstractEventViewComponent } from './abstract-event-view.component';

@Component({
  selector: 'app-event-bar-add',
  template: `
    @let e = event();
    @let p = player();
    <span>Bar "{{e.newBar.name}}" added to </span>
    <a [routerLink]="playerUrl()"><img [src]="p?.avatar" /></a>
  `,
  styles: [
    ':host { img { width: 32px; height: 32px; } }',
  ],
  imports: [RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventBarAddComponent extends AbstractEventViewComponent<EventPlayerBarAdd> {}