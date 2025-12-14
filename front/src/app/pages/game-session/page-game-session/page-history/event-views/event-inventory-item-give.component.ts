import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EventPlayerInventoryItemGive } from '@pagemaster/common/events-player.types';
import { SmartRoutes } from 'src/app/app.routes';
import { ImageComponent } from '../../../../../core/design-system/image.component';
import { ItemComponent } from '../../../../../core/player/inventories/items/item.component';
import { AbstractEventViewPlayerComponent } from './abstract-event-view-player.component';
import {
  EventLayoutComponent,
  EventLayoutContentComponent,
  EventLayoutIconComponent,
  EventLayoutTimestampComponent,
} from './event-layout.component';

@Component({
  selector: 'app-event-inventory-item-give',
  template: `
    @let e = event();
    @let fromPlayer = player();
    @let toPlayer = recipientPlayer();
    <event-layout [status]="'info'">
      <event-layout-icon [icon]="'package'" [status]="'info'" />
      <event-layout-timestamp [timestamp]="e.event.timestamp" />
      <event-layout-content>
        <a [routerLink]="playerUrl()"><ds-image [size]="'m'" [src]="fromPlayer?.avatar || ''" /></a>
        <span>gave</span>
        <app-item [item]="e.event.givenItem" [size]="'xs'" />
        <span>to</span>
        <a [routerLink]="recipientPlayerUrl()"><ds-image [size]="'m'" [src]="toPlayer?.avatar || ''" /></a>
      </event-layout-content>
    </event-layout>
  `,
  styleUrls: ['./event-view-common.scss'],
  styles: [`
    :host ::ng-deep event-layout-content .content {
      width: 100%;
      justify-content: space-between;
    }
  `],
  imports: [
    RouterModule,
    ImageComponent,
    ItemComponent,
    EventLayoutComponent,
    EventLayoutIconComponent,
    EventLayoutContentComponent,
    EventLayoutTimestampComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventInventoryItemGiveComponent extends AbstractEventViewPlayerComponent<EventPlayerInventoryItemGive> {
  protected recipientPlayer = computed(() => 
    this.gameSession.currentGameSession().players.find(p => p.id === this.event().event.toPlayerId),
  );

  protected recipientPlayerUrl() {
    const urlTree = this.router.createUrlTree(
      [
        '..',
        ...SmartRoutes.gameInstanceSession.children.playerLayout.path(this.recipientPlayer()?.id || '', 'details'),
      ],
      { relativeTo: this.route },
    );

    return decodeURIComponent(urlTree.toString());
  }
}
