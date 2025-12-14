import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EventPlayerInventoryItemGive } from '@pagemaster/common/events-player.types';
import { Item } from '@pagemaster/common/items.types';
import { SmartRoutes } from 'src/app/app.routes';
import { ImageComponent } from '../../../../../core/design-system/image.component';
import { ModalService } from '../../../../../core/modal';
import { ItemModalComponent } from '../../../../../core/player/inventories/items/item-modal.component';
import { ItemComponent } from '../../../../../core/player/inventories/items/item.component';
import { PlayerDataService } from '../../page-player/player-data.service';
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
        <span class="clickable-item" (click)="openItemDescriptionModal(e.event.givenItem, $event)">
          <app-item [item]="e.event.givenItem" [size]="'xs'" />
        </span>
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
    .clickable-item {
      cursor: pointer;
      display: inline-block;
    }
    .clickable-item:active {
      opacity: 0.7;
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
  providers: [PlayerDataService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventInventoryItemGiveComponent extends AbstractEventViewPlayerComponent<EventPlayerInventoryItemGive> {
  protected recipientPlayer = computed(() => 
    this.gameSession.currentGameSession().players.find(p => p.id === this.event().event.toPlayerId),
  );

  private playerDataService = inject(PlayerDataService);
  private modalService = inject(ModalService);

  protected openItemDescriptionModal(item: Item, event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    // Use ItemModalComponent and pass required inputs
    this.modalService.open(ItemModalComponent, {
      existingItem: item,
      currentOwnerId: this.event().event.toPlayerId,
      permissions: this.playerDataService.permissions(this.playerDataService.currentSession()!.participant.id)().inventory,
    });
  }

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
