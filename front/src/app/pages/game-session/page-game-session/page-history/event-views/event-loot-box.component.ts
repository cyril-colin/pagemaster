import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EventLootBox } from '@pagemaster/common/events.types';
import { LootBoxClaimModalComponent } from '../../../../../core/loot-box/loot-box-claim.modal.component';
import { ModalService } from '../../../../../core/modal';
import { ItemComponent } from '../../../../../core/player/inventories/items/item.component';
import { AbstractEventViewComponent } from './abstract-event-view.component';


@Component({
  selector: 'app-event-loot-box',
  template: `
    <button class="loot-box-button" (click)="openLootBoxModal()">
      <h3>🎁 Loot Box</h3>
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
      <p class="click-hint">Click to open</p>
    </button>
  `,
  styleUrls: ['./event-view-common.scss'],
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: var(--gap-medium);
    }

    .loot-box-button {
      all: unset;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--gap-medium);
      padding: var(--padding-large);
      border: 2px solid var(--color-border);
      border-radius: var(--border-radius);
      background: var(--color-background);
      transition: all 0.2s ease;
      width: 100%;
    }

    .loot-box-button:hover {
      border-color: var(--color-primary);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .loot-box-button h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
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
      opacity: 0.5;
    }

    .claimed-indicator {
      position: absolute;
      top: -4px;
      right: -4px;
      width: 20px;
      height: 20px;
      background: var(--color-success);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
    }

    .click-hint {
      margin: 0;
      font-size: var(--text-size-small);
      color: var(--color-text-secondary);
      font-style: italic;
    }
  `],
  imports: [RouterModule, ItemComponent],
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
