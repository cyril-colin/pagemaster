import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EventPlayerInventoryItemAdd } from '@pagemaster/common/events-player.types';
import { AbstractEventViewPlayerComponent } from './abstract-event-view-player.component';

@Component({
  selector: 'app-event-inventory-item-add',
  template: `
    @let e = event();
    @let inv = inventory();
    @let p = player();
    
    <img [src]="e.event.newItem.picture" />
    added to "{{inv?.name}}" of
    <a [routerLink]="playerUrl()"><img [src]="p?.avatar" /></a>
  `,
  styleUrls: ['./event-view-common.scss'],
  imports: [
    RouterModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventInventoryItemAddComponent extends AbstractEventViewPlayerComponent<EventPlayerInventoryItemAdd> {
  protected inventory = computed(() => {
    return this.player()?.attributes.inventory.find(i => i.id === this.event().event.inventoryId);
  });
}