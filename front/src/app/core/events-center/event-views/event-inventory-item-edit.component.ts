import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EventPlayerInventoryItemEdit } from '@pagemaster/common/events-player.types';
import { AbstractEventViewComponent } from './abstract-event-view.component';

@Component({
  selector: 'app-event-inventory-item-edit',
  template: 'Item edited in inventory {{event().inventoryId}}: {{event().newItem}}',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventInventoryItemEditComponent extends AbstractEventViewComponent<EventPlayerInventoryItemEdit> {

}