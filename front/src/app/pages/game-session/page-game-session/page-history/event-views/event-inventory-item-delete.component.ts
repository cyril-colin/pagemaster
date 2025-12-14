import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EventPlayerInventoryItemDelete } from '@pagemaster/common/events-player.types';
import { ImageComponent } from '../../../../../core/design-system/image.component';
import { ItemComponent } from '../../../../../core/player/inventories/items/item.component';
import { AbstractEventViewPlayerComponent } from './abstract-event-view-player.component';
import {
  EventLayoutAvatarComponent,
  EventLayoutComponent,
  EventLayoutContentComponent,
  EventLayoutIconComponent,
  EventLayoutTimestampComponent,
} from './event-layout.component';

@Component({
  selector: 'app-event-inventory-item-delete',
  template: `
    @let e = event();
    @let inv = inventory();
    @let p = player();
    <event-layout [status]="'danger'">
      <event-layout-icon [icon]="'backpack'" [status]="'danger'" />
      <event-layout-timestamp [timestamp]="e.event.timestamp" />
      <event-layout-content>
        <app-item [item]="e.event.deletedItem" [size]="'xs'" />
        <span>deleted from <strong>{{inv?.name}}</strong></span>
      </event-layout-content>
      <event-layout-avatar>
        <a [routerLink]="playerUrl()"><ds-image [size]="'m'" [src]="p?.avatar || ''" /></a>
      </event-layout-avatar>
    </event-layout>
  `,
  styleUrls: ['./event-view-common.scss'],
  imports: [
    RouterModule,
    ImageComponent,
    ItemComponent,
    EventLayoutComponent,
    EventLayoutIconComponent,
    EventLayoutContentComponent,
    EventLayoutTimestampComponent,
    EventLayoutAvatarComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventInventoryItemDeleteComponent extends AbstractEventViewPlayerComponent<EventPlayerInventoryItemDelete> {
  protected inventory = computed(() => {
    return this.player()?.attributes.inventory.find(i => i.id === this.event().event.inventoryId);
  });
}