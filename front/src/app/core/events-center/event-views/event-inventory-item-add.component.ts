import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EventPlayerInventoryItemAdd } from '@pagemaster/common/events-player.types';
import { ImageComponent } from '../../design-system/image.component';
import { ItemComponent } from '../../player/inventories/items/item.component';
import { AbstractEventViewPlayerComponent } from './abstract-event-view-player.component';

@Component({
  selector: 'app-event-inventory-item-add',
  template: `
    @let e = event();
    @let inv = inventory();
    @let p = player();
    
    @for(item of e.event.newItems; track item.id) {
      <app-item [item]="item" [mode]="'compact'" />
    }
    
    added to "{{inv?.name}}" of
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
export class EventInventoryItemAddComponent extends AbstractEventViewPlayerComponent<EventPlayerInventoryItemAdd<''>> {
  protected inventory = computed(() => {
    return this.player()?.attributes.inventory.find(i => i.id === this.event().event.inventoryId);
  });
}