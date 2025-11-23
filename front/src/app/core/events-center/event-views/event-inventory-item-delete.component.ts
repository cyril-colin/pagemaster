import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EventPlayerInventoryItemDelete } from '@pagemaster/common/events-player.types';
import { AbstractEventViewComponent } from './abstract-event-view.component';

@Component({
  selector: 'app-event-inventory-item-delete',
  template: `
    @let e = event();
    @let inv = inventory();
    @let p = player();
    
    <img [src]="e.deletedItem.picture" />
    deleted from "{{inv?.name}}" of
    <a [routerLink]="playerUrl()"><img [src]="p?.avatar" /></a>
  `,
  styles: [
    `:host {
      img {
        width: 32px;
        height: 32px;
      }
    }`,
  ],
  imports: [
    RouterModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventInventoryItemDeleteComponent extends AbstractEventViewComponent<EventPlayerInventoryItemDelete> {
  protected inventory = computed(() => {
    return this.player()?.attributes.inventory.find(i => i.id === this.event().inventoryId);
  });
}