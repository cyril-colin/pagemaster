
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EventPlayerInventoryItemEdit } from '@pagemaster/common/events-player.types';
import { AbstractEventViewPlayerComponent } from './abstract-event-view-player.component';

@Component({
  selector: 'app-event-inventory-item-edit',
  template: `
    @let e = event();
    @let inv = inventory();
    @let p = player();
    
    <img [src]="e.newItem.picture" />
    edited in "{{inv?.name}}" of
    <a [routerLink]="playerUrl()"><img [src]="p?.avatar" /></a>
  `,
  styleUrls: ['./event-view-common.scss'],
  imports: [
    RouterModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventInventoryItemEditComponent extends AbstractEventViewPlayerComponent<EventPlayerInventoryItemEdit> {
  protected inventory = computed(() => {
    return this.player()?.attributes.inventory.find(i => i.id === this.event().inventoryId);
  });
}