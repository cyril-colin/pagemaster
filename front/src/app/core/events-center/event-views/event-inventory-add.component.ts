import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EventPlayerInventoryAdd } from '@pagemaster/common/events-player.types';
import { AbstractEventViewComponent } from './abstract-event-view.component';

@Component({
  selector: 'app-event-inventory-add',
  template: 'New inventory added: {{event().newInventory}}',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventInventoryAddComponent extends AbstractEventViewComponent<EventPlayerInventoryAdd> {

}