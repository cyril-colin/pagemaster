
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EventPlayerInventoryDelete } from '@pagemaster/common/events-player.types';
import { AbstractEventViewComponent } from './abstract-event-view.component';

@Component({
  selector: 'app-event-inventory-delete',
  template: `
    @let inv = inventory();
    @let p = player();
    
    <span>Inventory "{{inv?.name}}" deleted from </span>
    <a [routerLink]="playerUrl()"><img [src]="p?.avatar" /></a>
  `,
  styleUrls: ['./event-view-common.scss'],
  imports: [
    RouterModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventInventoryDeleteComponent extends AbstractEventViewComponent<EventPlayerInventoryDelete> {
  protected inventory = computed(() => {
    return this.player()?.attributes.inventory.find(i => i.id === this.event().inventoryId);
  });
}