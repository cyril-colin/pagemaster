import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EventLootBox } from '@pagemaster/common/events.types';
import { LootBoxClaimModalComponent } from '../../../../../core/loot-box/loot-box-claim.modal.component';
import { ModalService } from '../../../../../core/modal';
import { ItemComponent } from '../../../../../core/player/inventories/items/item.component';
import { AbstractEventViewComponent } from './abstract-event-view.component';
import {
  EventLayoutComponent,
  EventLayoutContentComponent,
  EventLayoutIconComponent,
  EventLayoutTimestampComponent,
} from './event-layout.component';


@Component({
  selector: 'app-event-loot-box',
  template: `
    <event-layout [status]="'success'">
      <event-layout-icon icon="gift" [status]="'success'"></event-layout-icon>
      <event-layout-timestamp [timestamp]="event().event.timestamp"></event-layout-timestamp>
      <event-layout-content>
        <button class="loot-box-button" (click)="openLootBoxModal()">
          <section class="loot-box-items">
            @for(i of event().event.lootBox.items; track i.item.id) {
              <div class="item-container" [class.claimed]="i.claimedByPlayerId !== null">
                <app-item [item]="i.item" [size]="'xs'" />
                @if(i.claimedByPlayerId) {
                  <div class="claimed-indicator">✓</div>
                }
              </div>
            }
          </section>
          <p class="click-hint">Tap to claim items</p>
        </button>
      </event-layout-content>
    </event-layout>
  `,
  styleUrls: ['./event-view-common.scss'],
  styles: [`
    :host {
      display: flex;
      width: 100%;
    }

    .loot-box-button {
      all: unset;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--gap-medium);
      transition: opacity var(--transition-speed);
      width: 100%;
      box-sizing: border-box;
    }

    .loot-box-button:hover {
      opacity: 0.8;
    }

    .loot-box-button h3 {
      margin: 0;
      font-size: var(--text-size-xlarge);
      font-weight: var(--text-weight-bold);
      color: var(--text-primary);
    }

    .loot-box-items {
      display: flex;
      flex-wrap: wrap;
      gap: var(--gap-small);
      justify-content: center;
    }

    .item-container {
      position: relative;
    }

    .item-container.claimed {
      opacity: 0.4;
    }

    .claimed-indicator {
      position: absolute;
      top: -4px;
      right: -4px;
      width: 20px;
      height: 20px;
      background: var(--color-success);
      color: var(--text-on-primary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: var(--text-weight-bold);
    }

    .click-hint {
      margin: 0;
      font-size: var(--text-size-small);
      color: var(--text-tertiary);
      font-style: italic;
    }
  `],
  imports: [RouterModule,
    ItemComponent,
    EventLayoutComponent,
    EventLayoutIconComponent,
    EventLayoutContentComponent,
    EventLayoutTimestampComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventLootBoxComponent extends AbstractEventViewComponent<EventLootBox> {
  private modalService = inject(ModalService);

  protected openLootBoxModal(): void {
    this.modalService.open(LootBoxClaimModalComponent, {
      lootBoxEvent: this.event().event,
    });
  }
}
