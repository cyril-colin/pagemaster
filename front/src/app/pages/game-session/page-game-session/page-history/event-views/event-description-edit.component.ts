
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EventPlayerDescriptionEdit } from '@pagemaster/common/events-player.types';
import { ImageComponent } from '../../../../../core/design-system/image.component';
import { AbstractEventViewPlayerComponent } from './abstract-event-view-player.component';

@Component({
  selector: 'app-event-description-edit',
  template: `
    @let p = player();
    <span>Description updated for </span>
    <a [routerLink]="playerUrl()"><ds-image [src]="p?.avatar || ''" /></a>
  `,
  styleUrls: ['./event-view-common.scss'],
  imports: [RouterModule, ImageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventDescriptionEditComponent extends AbstractEventViewPlayerComponent<EventPlayerDescriptionEdit> {}