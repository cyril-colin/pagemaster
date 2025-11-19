import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EventPlayerInventoryDelete } from '@pagemaster/common/events-player.types';
import { AbstractEventViewComponent } from './abstract-event-view.component';

@Component({
  selector: 'app-event-inventory-delete',
  template: 'Inventory deleted: {{event().inventoryId}}',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventInventoryDeleteComponent extends AbstractEventViewComponent<EventPlayerInventoryDelete> {

}