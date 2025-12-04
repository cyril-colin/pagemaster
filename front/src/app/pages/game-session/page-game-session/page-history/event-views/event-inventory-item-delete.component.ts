import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EventPlayerInventoryItemDelete } from '@pagemaster/common/events-player.types';
import { ImageComponent } from '../../../../../core/design-system/image.component';
import { ItemComponent } from '../../../../../core/player/inventories/items/item.component';
import { AbstractEventViewPlayerComponent } from './abstract-event-view-player.component';

@Component({
  selector: 'app-event-inventory-item-delete',
  template: `
    @let e = event();
    @let inv = inventory();
    @let p = player();
    <app-item [item]="e.event.deletedItem" [size]="'s'" />
    deleted from "{{inv?.name}}" of
    <a [routerLink]="playerUrl()"><ds-image [src]="p?.avatar || ''" /></a>
  `,
  styleUrls: ['./event-view-common.scss'],
  imports: [
    RouterModule,
    ImageComponent,
    ItemComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventInventoryItemDeleteComponent extends AbstractEventViewPlayerComponent<EventPlayerInventoryItemDelete> {
  protected inventory = computed(() => {
    return this.player()?.attributes.inventory.find(i => i.id === this.event().event.inventoryId);
  });
}