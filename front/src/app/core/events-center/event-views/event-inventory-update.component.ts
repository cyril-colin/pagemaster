import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EventPlayerInventoryUpdate } from '@pagemaster/common/events-player.types';
import { AbstractEventViewComponent } from './abstract-event-view.component';

@Component({
  selector: 'app-event-inventory-update',
  template: 'Inventory updated: {{event().newInventory}}',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventInventoryUpdateComponent extends AbstractEventViewComponent<EventPlayerInventoryUpdate> {

}