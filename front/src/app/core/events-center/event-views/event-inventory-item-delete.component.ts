import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EventPlayerInventoryItemDelete } from '@pagemaster/common/events-player.types';
import { AbstractEventViewComponent } from './abstract-event-view.component';

@Component({
  selector: 'app-event-inventory-item-delete',
  template: 'Item deleted from inventory {{event().inventoryId}}: {{event().itemId}}',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventInventoryItemDeleteComponent extends AbstractEventViewComponent<EventPlayerInventoryItemDelete> {

}