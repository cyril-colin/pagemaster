
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EventPlayerBarEdit } from '@pagemaster/common/events-player.types';
import { ImageComponent } from '../../design-system/image.component';
import { AbstractEventViewPlayerComponent } from './abstract-event-view-player.component';

@Component({
  selector: 'app-event-bar-edit',
  template: `
    @let e = event();
    @let p = player();
    <span>Bar "{{e.event.newBar.name}}" edited for </span>
    <a [routerLink]="playerUrl()"><ds-image [src]="p?.avatar || ''" /></a>
  `,
  styleUrls: ['./event-view-common.scss'],
  imports: [RouterModule, ImageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventBarEditComponent extends AbstractEventViewPlayerComponent<EventPlayerBarEdit> {}