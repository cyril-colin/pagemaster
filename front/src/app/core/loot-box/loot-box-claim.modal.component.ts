import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { EventLootBox } from '@pagemaster/common/events.types';
import { Item } from '@pagemaster/common/items.types';
import { ParticipantType, Player } from '@pagemaster/common/pagemaster.types';
import { catchError, EMPTY, tap } from 'rxjs';
import { SmartRoutes } from 'src/app/app.routes';
import { CurrentGameSessionState } from '../current-game-session.state';
import { CurrentParticipantState } from '../current-participant.state';
import { ButtonComponent } from '../design-system/button.component';
import { CarouselComponent } from '../design-system/carousel.component';
import { EventsCenterStateService } from '../events-center/events-center.state';
import { ModalService } from '../modal';
import {
  ModalLayoutComponent,
  ModalLayoutFooterComponent,
  ModalLayoutHeaderComponent,
  ModalLayoutSectionComponent,
} from '../modal/modal-layout';
import { GiveItemModalComponent } from '../player/inventories/items/give-item-modal.component';
import { ItemDescriptionComponent } from '../player/inventories/items/item-description.component';
import { GameEventRepository } from '../repositories/game-event.repository';

type LootBoxItem = { item: Item, claimedByPlayerId: string | null };

@Component({
  selector: 'app-loot-box-claim-modal',
  standalone: true,
  template: `
    <ds-modal-layout>
      <ds-modal-layout-header [title]="'🎁 Loot Box'">
      </ds-modal-layout-header>

      <ds-modal-layout-section>
        <div class="carousel-wrapper">
          <ds-carousel 
            #carousel
            [items]="lootBoxItems()" 
            [trackBy]="trackByItemId"
            [index]="currentItemIndex()"
            (indexChange)="onIndexChange($event)"
            [showIndicators]="false"
          >
            <ng-template #carouselItem let-lootItem let-i="index">
              <div class="carousel-item">
                <app-item-description [item]="lootItem.item" [size]="'m'" />

                <!-- Top-right compact action / claimed badge overlay -->
                <div class="top-right-action">
                  @if(lootItem.claimedByPlayerId) {
                    @let claimedPlayer = getPlayerById(lootItem.claimedByPlayerId);
                    @if(claimedPlayer) {
                        <a class="claimed-small" href="#" (click)="openPlayerAndClose($event, claimedPlayer.id)">
                          <img 
                            [src]="claimedPlayer.avatar" 
                            [alt]="claimedPlayer.name"
                            class="claimed-avatar-small"
                          />
                          <span class="claimed-text-small">{{ claimedPlayer.name }}</span>
                        </a>
                    }
                  } @else {
                    @if(isGameMaster()) {
                      <ds-button 
                        class="top-action-button"
                        [mode]="'primary'" 
                        [icon]="'arrow-right'"
                        (click)="openGiveItemModal(lootItem)"
                      >
                        Give
                      </ds-button>
                    } @else if(canClaim(lootItem)) {
                      <ds-button 
                        class="top-action-button"
                        [mode]="'primary'" 
                        [icon]="'plus'"
                        (click)="onItemClick(lootItem)"
                      >
                        Claim
                      </ds-button>
                    }
                  }
                </div>
              </div>
            </ng-template>
          </ds-carousel>

          <!-- Outside overlay for current item (avoids carousel clipping) -->
          @if(currentDisplayedLootItem()) {
            @let currentItem = currentDisplayedLootItem()!;
            <div class="top-right-action-outside">
              @if(currentItem.claimedByPlayerId) {
                @let claimedPlayer = getPlayerById(currentItem.claimedByPlayerId);
                @if(claimedPlayer) {
                  <a class="claimed-small" href="#" (click)="openPlayerAndClose($event, claimedPlayer.id)">
                    <img [src]="claimedPlayer.avatar" [alt]="claimedPlayer.name" class="claimed-avatar-small" />
                    <span class="claimed-text-small">{{ claimedPlayer.name }}</span>
                  </a>
                }
              } @else {
                @if(isGameMaster()) {
                  <ds-button class="top-action-button"
                  [mode]="'primary'"
                  [icon]="'arrow-right'"
                  (click)="openGiveItemModal(currentItem)">Give</ds-button>
                } @else if(canClaim(currentItem)) {
                  <ds-button class="top-action-button"
                  [mode]="'primary'"
                  [icon]="'plus'"
                  (click)="onItemClick(currentItem)">Claim</ds-button>
                }
              }
            </div>
          }
        </div>

        @if(errorMessage()) {
          <div class="error-message">
            {{ errorMessage() }}
          </div>
        }
      </ds-modal-layout-section>

      <ds-modal-layout-footer>
        <div class="footer-controls">
          @if(lootBoxItems().length > 1) {
            <button
              class="footer-nav"
              (click)="carousel?.previous()"
              [disabled]="!carousel || carousel.currentIndex() === 0"
              [class.disabled]="!carousel || carousel.currentIndex() === 0"
              [attr.aria-disabled]="!carousel || carousel.currentIndex() === 0"
              aria-label="Previous"
            >
              <span class="arrow">‹</span>
            </button>

            <div class="footer-indicators">
              @for(item of lootBoxItems(); track trackByItemId(i, item); let i = $index) {
                <button
                  class="footer-indicator"
                  [class.active]="i === carousel.currentIndex()"
                  (click)="carousel.goTo(i)"
                  [attr.aria-label]="'Go to item ' + (i + 1)"
                ></button>
              }
            </div>

            <button
              class="footer-nav"
              (click)="carousel?.next()"
              [disabled]="!carousel || carousel.currentIndex() === lootBoxItems().length - 1"
              [class.disabled]="!carousel || carousel.currentIndex() === lootBoxItems().length - 1"
              [attr.aria-disabled]="!carousel || carousel.currentIndex() === lootBoxItems().length - 1"
              aria-label="Next"
            >
              <span class="arrow">›</span>
            </button>
          }
        </div>
      </ds-modal-layout-footer>
    </ds-modal-layout>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
    }

    .subtitle {
      margin: 0;
      color: var(--color-text-secondary);
      font-size: var(--text-size-medium);
      text-align: center;
      margin-top: var(--gap-small);
    }

    ds-modal-layout-section {
      display: flex;
      flex-direction: column;
      gap: var(--gap-large);
      overflow: hidden !important;
    }

    .carousel-wrapper {
      flex: 1;
      /* allow overlays rendered after the carousel to be visible (avoid clipping) */
      overflow: visible;
      min-height: 400px;
      position: relative;
    }

    .carousel-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--gap-small);
      padding: var(--padding-small);
      height: 100%;
      /* allow overlays to be visible and not clipped */
      overflow: visible;
      box-sizing: border-box;
      position: relative; /* allow absolute children like top-right overlay */
    }

    .claimed-section {
      width: 100%;
      display: flex;
      justify-content: center;
      margin-top: var(--gap-small);
    }

    .claimed-banner {
      display: flex;
      align-items: center;
      gap: var(--gap-small);
      padding: var(--padding-small) var(--padding-medium);
      background: var(--color-success-light, #e6f4ea);
      border: 2px solid var(--color-success);
      border-radius: var(--border-radius);
      opacity: 0.8;
    }

    .claimed-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--color-success);
    }

    .claimed-text {
      font-weight: 600;
      color: var(--color-success);
      font-size: var(--text-size-small);
    }

    .action-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--gap-small);
      margin-top: var(--gap-small);
      /* Hidden because action button is shown top-right */
      display: none;
    }

    /* Top-right overlay styles */
    .top-right-action {
      position: absolute;
      top: var(--gap-medium);
      right: var(--gap-medium);
      display: flex !important;
      align-items: center;
      gap: var(--gap-small);
      z-index: 9999 !important; /* force above any stacking context */
      pointer-events: auto;
      -webkit-transform: translateZ(0);
      transform: translateZ(0);
    }

    /* Outside overlay placed after the carousel to avoid slide clipping */
    .top-right-action-outside {
      position: absolute;
      top: var(--gap-medium);
      right: var(--gap-medium);
      display: flex;
      align-items: center;
      gap: var(--gap-small);
      z-index: 11000; /* above carousel and other content */
      pointer-events: auto;
      -webkit-transform: translateZ(0);
      transform: translateZ(0);
    }

    .claimed-small {
      display: flex;
      align-items: center;
      gap: var(--gap-small);
      padding: 6px 10px;
      background: var(--color-success);
      border-radius: 999px;
      border: 1px solid var(--color-success-hover);
      color: var(--text-on-primary);
      box-shadow: 0 6px 18px rgba(0,0,0,0.28);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      min-width: 88px;
      justify-content: center;
    }

    .claimed-avatar-small {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--color-success);
    }

    .claimed-text-small {
      font-weight: 700;
      color: var(--text-on-primary);
      font-size: 13px;
      white-space: nowrap;
      letter-spacing: 0.02em;
    }

    .top-action-button {
      height: 32px;
      padding: 0 8px;
      font-size: 13px;
      display: inline-flex;
      align-items: center;
      z-index: 6;
    }

    .top-right-action {
      z-index: 12; /* ensure overlay is above carousel content */
    }

    /* Mobile fallback: show bottom action and hide top-right overlay on small screens */
    @media (max-width: 520px) {
      .top-right-action { display: none !important; }
      .action-section { display: flex !important; }
      .carousel-item { padding-bottom: calc(var(--footer-height) + var(--gap-medium)); }
      .top-action-button { height: 40px; min-width: 84px; }
    }

    .no-claim-message {
      color: var(--color-text-secondary);
      font-style: italic;
      text-align: center;
      margin: 0;
    }

    .error-message {
      padding: var(--padding-medium);
      background: var(--color-danger-light, #fee);
      color: var(--color-danger);
      border-radius: var(--border-radius);
      text-align: center;
    }

    .footer-controls {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--gap-small);
      width: 100%;
    }

    .footer-nav {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--color-background-secondary);
      border: 2px solid var(--color-border);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--text-primary);
      box-shadow: 0 3px 8px rgba(0,0,0,0.35);
    }

    /* Disable color changes on hover for footer nav buttons */
    .footer-nav:hover {
      background: var(--color-background-secondary);
      border-color: var(--color-border);
      color: var(--text-primary);
      transform: none;
    }

    .footer-nav.disabled,
    .footer-nav[disabled] {
      opacity: 0.48;
      cursor: default;
      transform: none;
      pointer-events: none;
      box-shadow: none;
      color: var(--text-disabled, rgba(255,255,255,0.45));
      border-color: var(--color-border-light);
      background: var(--color-background-secondary);
    }

    .footer-indicators {
      display: flex;
      gap: var(--gap-small);
      align-items: center;
      padding: var(--padding-small) 0;
    }

    .footer-indicator {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 2px solid var(--color-border);
      background: transparent;
      cursor: pointer;
      padding: 0;
    }

    .footer-indicator.active {
      background: var(--color-primary);
      border-color: var(--color-primary);
    }

    /* Remove transient focus/active visuals after click — keep only active state tied to current index */
    .footer-nav:focus,
    .footer-nav:active,
    .footer-indicator:focus,
    .footer-indicator:active {
      outline: none;
      box-shadow: none;
      transform: none;
    }

    .footer-nav,
    .footer-indicator {
      -webkit-tap-highlight-color: transparent;
    }
  `],
  imports: [
    ItemDescriptionComponent,
    ButtonComponent,
    CarouselComponent,
    ModalLayoutComponent,
    ModalLayoutHeaderComponent,
    ModalLayoutSectionComponent,
    ModalLayoutFooterComponent,
    RouterModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LootBoxClaimModalComponent {
  public lootBoxEvent = input.required<EventLootBox>();
  private dialogRef = inject(DialogRef);
  protected router = inject(Router);

  protected currentGameSession = inject(CurrentGameSessionState);
  protected currentParticipant = inject(CurrentParticipantState);
  protected gameEventRepository = inject(GameEventRepository);
  protected eventsCenterState = inject(EventsCenterStateService);
  protected modalService = inject(ModalService);

  // Computed signal that gets the latest version of the loot box event from the events list
  protected currentLootBoxEvent = computed(() => {
    const lootBoxId = this.lootBoxEvent().id;
    const latestEvent = this.eventsCenterState.events().find(e => e.event.id === lootBoxId);
    return latestEvent ? (latestEvent.event as EventLootBox) : this.lootBoxEvent();
  });

  protected lootBoxItems = computed(() => {
    return this.currentLootBoxEvent().lootBox.items;
  });

  protected errorMessage = signal<string>('');
  protected currentItemIndex = signal<number>(0);

  // Signal for the currently displayed loot item (based on currentItemIndex)
  protected currentDisplayedLootItem = computed(() => {
    const items = this.lootBoxItems();
    const idx = this.currentItemIndex();
    return items && items.length ? items[idx] : null;
  });

  protected trackByItemId = (index: number, lootItem: LootBoxItem) => lootItem.item.id;

  protected isGameMaster = computed(() => {
    const participant = this.currentParticipant.currentParticipant();
    return participant ? participant.type === ParticipantType.GameMaster : false;
  });

  protected onIndexChange(index: number): void {
    this.currentItemIndex.set(index);
    // Clear any error message when navigating to a new item
    this.errorMessage.set('');
  }

  protected canClaim(lootItem: LootBoxItem): boolean {
    if (lootItem.claimedByPlayerId !== null) {
      return false;
    }

    if (this.isGameMaster()) {
      return false; // GM uses "Give to Player" button instead
    }

    // Players can only claim if they have an eligible inventory
    const currentPlayer = this.currentGameSession.currentGameSession().players.find(
      p => p.id === this.currentParticipant.currentParticipantId(),
    );

    if (!currentPlayer) {
      return false;
    }

    return currentPlayer.attributes.inventory.some(inv => 
      !inv.isSecret && inv.capacity.type === 'weight',
    );
  }

  protected getPlayerById(playerId: string | null): Player | null {
    if (!playerId) return null;
    return this.currentGameSession.currentGameSession().players.find(p => p.id === playerId) || null;
  }

  protected onItemClick(lootItem: LootBoxItem): void {
    if (!this.canClaim(lootItem)) {
      return;
    }

    // Player claims item directly
    this.claimItem(lootItem);
  }

  protected claimItem(lootItem: LootBoxItem): void {
    const currentPlayer = this.currentGameSession.currentGameSession().players.find(
      p => p.id === this.currentParticipant.currentParticipantId(),
    );

    if (!currentPlayer) {
      this.errorMessage.set('Player not found');
      return;
    }

    const command = {
      type: 'player.loot-box.item.claimed',
      gameSessionId: this.currentGameSession.currentGameSession().id,
      playerId: currentPlayer.id,
      lootBoxEventId: this.lootBoxEvent().id,
      itemId: lootItem.item.id,
    };

    this.errorMessage.set('');
    this.gameEventRepository.postCommand(command).pipe(
      tap(() => {
        // Success - the socket will update the loot box event
      }),
      catchError((err: { error?: { message?: string } }) => {
        this.errorMessage.set(err.error?.message || 'Failed to claim item');
        return EMPTY;
      }),
    ).subscribe();
  }

  protected openGiveItemModal(lootItem: LootBoxItem): void {
    if (lootItem.claimedByPlayerId !== null) {
      return;
    }

    // Find a player to use as currentOwnerId - use first player or GM's perspective
    const currentPlayer = this.currentGameSession.currentGameSession().players[0];
    if (!currentPlayer) {
      this.errorMessage.set('No players available');
      return;
    }

    const giveModalRef = this.modalService.open(GiveItemModalComponent, {
      currentOwnerId: currentPlayer.id, // Dummy owner for unclaimed loot box items
    });

    giveModalRef.componentRef.instance.recipientSelected.subscribe((recipient: Player) => {
      void (async () => {
        await giveModalRef.close();
        
        const confirmed = await this.modalService.confirmation(
          `Are you sure you want to give "${lootItem.item.name}" to ${recipient.name}?`,
          'Confirm Give Item',
        );

        if (confirmed === 'confirmed') {
          this.assignItemToPlayer(lootItem, recipient.id);
        }
      })();
    });

    giveModalRef.componentRef.instance.cancel.subscribe(() => {
      void giveModalRef.close();
    });
  }

  protected assignItemToPlayer(lootItem: LootBoxItem, playerId: string): void {
    const command = {
      type: 'player.loot-box.item.claimed',
      gameSessionId: this.currentGameSession.currentGameSession().id,
      playerId: playerId,
      lootBoxEventId: this.lootBoxEvent().id,
      itemId: lootItem.item.id,
    };

    this.errorMessage.set('');
    this.gameEventRepository.postCommand(command).pipe(
      tap(() => {
        // Success - the socket will update the loot box event
      }),
      catchError((err: { error?: { message?: string } }) => {
        this.errorMessage.set(err.error?.message || 'Failed to assign item');
        return EMPTY;
      }),
    ).subscribe();
  }

  protected close(): void {
    this.dialogRef.close();
  }

  protected playerUrl(playerId: string) {
    const urlTree = this.router.createUrlTree(
      [
        '',
        ...SmartRoutes.gameInstanceSession.path(this.currentGameSession.currentGameSession().id),
        ...SmartRoutes.gameInstanceSession.children.playerLayout.path(playerId || ''),
      ],
    );

    return decodeURIComponent(urlTree.toString());
  }

  protected openPlayerAndClose(event: MouseEvent, playerId: string) {
    event.preventDefault();
    const url = this.playerUrl(playerId);
    // Close the modal first, then navigate
    this.dialogRef.close();
    void this.router.navigateByUrl(url);
  }
}
