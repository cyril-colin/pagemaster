
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
  styles: [
    `:host {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      img {
        border-radius: 50%;
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
export class EventInventoryDeleteComponent extends AbstractEventViewComponent<EventPlayerInventoryDelete> {
  protected inventory = computed(() => {
    return this.player()?.attributes.inventory.find(i => i.id === this.event().inventoryId);
  });
}