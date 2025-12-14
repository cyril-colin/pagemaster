import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EventPlayerInventoryItemAdd } from '@pagemaster/common/events-player.types';
import { Item } from '@pagemaster/common/items.types';
import { ModalService } from 'src/app/core/modal';
import { ItemModalComponent } from 'src/app/core/player/inventories/items/item-modal.component';
import { ImageComponent } from '../../../../../core/design-system/image.component';
import { ItemComponent } from '../../../../../core/player/inventories/items/item.component';
import { PlayerDataService } from '../../page-player/player-data.service';
import { AbstractEventViewPlayerComponent } from './abstract-event-view-player.component';
import {
  EventLayoutAvatarComponent,
  EventLayoutComponent,
  EventLayoutContentComponent,
  EventLayoutIconComponent,
  EventLayoutTimestampComponent,
} from './event-layout.component';


@Component({
  selector: 'app-event-inventory-item-add',
  template: `
    @let e = event();
    @let inv = inventory();
    @let p = player();
    <event-layout [status]="'success'">
      <event-layout-icon [icon]="'backpack'" [status]="'success'" />
      <event-layout-timestamp [timestamp]="e.event.timestamp" />
      <event-layout-content>
        @for(item of e.event.newItems; track item.id) {
        <span class="clickable-item" (click)="openItemDescriptionModal(item, $event)">
          <app-item [item]="item" [size]="'xs'" />
        </span>
        }
        <span>added to <strong>{{inv?.name}}</strong></span>
      </event-layout-content>
      <event-layout-avatar>
        <a [routerLink]="playerUrl()"><ds-image [size]="'m'" [src]="p?.avatar || ''" /></a>
      </event-layout-avatar>
    </event-layout>
  `,
  styleUrls: ['./event-view-common.scss'],
  styles: [`
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
    EventLayoutAvatarComponent,
  ],
  providers: [PlayerDataService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventInventoryItemAddComponent extends AbstractEventViewPlayerComponent<EventPlayerInventoryItemAdd<''>> {
  protected inventory = computed(() => {
    return this.player()?.attributes.inventory.find(i => i.id === this.event().event.inventoryId);
  });

  
  private playerDataService = inject(PlayerDataService);
  private modalService = inject(ModalService);

  protected openItemDescriptionModal(item: Item, event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    // Use ItemModalComponent and pass required inputs
    this.modalService.open(ItemModalComponent, {
      existingItem: item,
      currentOwnerId: this.event().event.playerId,
      permissions: this.playerDataService.permissions(this.playerDataService.currentSession()!.participant.id)().inventory,
    });
  }
}