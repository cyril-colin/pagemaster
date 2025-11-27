
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EventPlayerInventoryUpdate } from '@pagemaster/common/events-player.types';
import { AbstractEventViewPlayerComponent } from './abstract-event-view-player.component';

@Component({
  selector: 'app-event-inventory-update',
  template: `
    @let e = event();
    @let p = player();
    <span>Inventory updated: "{{e.event.newInventory.name}}" for </span>
    <a [routerLink]="playerUrl()"><img [src]="p?.avatar" /></a>
  `,
  styleUrls: ['./event-view-common.scss'],
  imports: [RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventInventoryUpdateComponent extends AbstractEventViewPlayerComponent<EventPlayerInventoryUpdate> {}