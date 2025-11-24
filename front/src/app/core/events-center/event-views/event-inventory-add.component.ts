import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EventPlayerInventoryAdd } from '@pagemaster/common/events-player.types';
import { AbstractEventViewComponent } from './abstract-event-view.component';

@Component({
  selector: 'app-event-inventory-add',
  template: `
    @let e = event();
    @let p = player();
    
    <span>Inventory "{{e.newInventory.name}}" added to </span>
    <a [routerLink]="playerUrl()"><img [src]="p?.avatar" /></a>
  `,
  styleUrls: ['./event-view-common.scss'],
  imports: [
    RouterModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventInventoryAddComponent extends AbstractEventViewComponent<EventPlayerInventoryAdd> {

}