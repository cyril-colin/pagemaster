import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EventPlayerInventoryItemAdd } from '@pagemaster/common/events-player.types';
import { AbstractEventViewComponent } from './abstract-event-view.component';

@Component({
  selector: 'app-event-inventory-item-add',
  template: 'New item added to inventory {{event().inventoryId}}: {{event().newItem}}',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventInventoryItemAddComponent extends AbstractEventViewComponent<EventPlayerInventoryItemAdd> {

}