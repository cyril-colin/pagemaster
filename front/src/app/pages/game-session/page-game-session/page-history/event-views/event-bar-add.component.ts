
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EventPlayerBarAdd } from '@pagemaster/common/events-player.types';
import { ImageComponent } from '../../../../../core/design-system/image.component';
import { AbstractEventViewPlayerComponent } from './abstract-event-view-player.component';

@Component({
  selector: 'app-event-bar-add',
  template: `
    @let e = event();
    @let p = player();
    <span>Bar "{{e.event.newBar.name}}" added to </span>
    <a [routerLink]="playerUrl()"><ds-image [src]="p?.avatar || ''" /></a>
  `,
  styleUrls: ['./event-view-common.scss'],
  imports: [RouterModule, ImageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventBarAddComponent extends AbstractEventViewPlayerComponent<EventPlayerBarAdd> {}