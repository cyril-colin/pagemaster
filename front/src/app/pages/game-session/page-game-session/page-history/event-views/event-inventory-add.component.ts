import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EventPlayerInventoryAdd } from '@pagemaster/common/events-player.types';
import { ImageComponent } from '../../../../../core/design-system/image.component';
import { AbstractEventViewPlayerComponent } from './abstract-event-view-player.component';

@Component({
  selector: 'app-event-inventory-add',
  template: `
    @let e = event();
    @let p = player();
    
    <span>Inventory "{{e.event.newInventory.name}}" added to </span>
    <a [routerLink]="playerUrl()"><ds-image [src]="p?.avatar || ''" /></a>
  `,
  styleUrls: ['./event-view-common.scss'],
  imports: [
    RouterModule,
    ImageComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventInventoryAddComponent extends AbstractEventViewPlayerComponent<EventPlayerInventoryAdd> {

}