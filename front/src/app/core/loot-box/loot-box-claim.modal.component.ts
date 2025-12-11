import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { EventLootBox } from '@pagemaster/common/events.types';
import { Item } from '@pagemaster/common/items.types';
import { ParticipantType, Player } from '@pagemaster/common/pagemaster.types';
import { catchError, EMPTY, tap } from 'rxjs';
import { CurrentGameSessionState } from '../current-game-session.state';
import { CurrentParticipantState } from '../current-participant.state';
import { ButtonComponent } from '../design-system/button.component';
import { EventsCenterStateService } from '../events-center/events-center.state';
import { ItemComponent } from '../player/inventories/items/item.component';
import { GameEventRepository } from '../repositories/game-event.repository';

type LootBoxItem = { item: Item, claimedByPlayerId: string | null };

@Component({
  selector: 'app-loot-box-claim-modal',
  standalone: true,
  template: `
    <div class="modal-header">
      <h2>🎁 Loot Box</h2>
      <p class="subtitle">{{ isGameMaster() ? 'Assign items to players' : 'Claim your items' }}</p>
    </div>

    <div class="items-grid">
      @for(lootItem of currentLootBoxEvent().lootBox.items; track lootItem.item.id) {
        <div 
          class="item-wrapper"
          [class.claimed]="lootItem.claimedByPlayerId !== null"
          [class.clickable]="canClaim(lootItem)"
          (click)="onItemClick(lootItem)"
        >
          <app-item [item]="lootItem.item" [size]="'m'" />
          
          @if(lootItem.claimedByPlayerId) {
            <div class="claimed-badge">
              @let claimedPlayer = getPlayerById(lootItem.claimedByPlayerId);
              @if(claimedPlayer) {
                <img 
                  [src]="claimedPlayer.avatar" 
                  [alt]="claimedPlayer.name"
                  class="player-avatar"
                />
              }
            </div>
          }
        </div>
      }
    </div>

    @if(isGameMaster() && selectedItem()) {
      <div class="gm-controls">
        <label>Assign to player:</label>
        <select [value]="selectedPlayerId() || ''" (change)="onPlayerSelect($event)" class="player-select">
          <option value="">-- Select Player --</option>
          @for(player of availablePlayers(); track player.id) {
            <option [value]="player.id">{{ player.name }}</option>
          }
        </select>
        <ds-button 
          [mode]="'primary'" 
          [disabled]="!selectedPlayerId()"
          (click)="assignItemToPlayer()"
        >
          Assign Item
        </ds-button>
      </div>
    }

    @if(errorMessage()) {
      <div class="error-message">
        {{ errorMessage() }}
      </div>
    }

    <div class="modal-footer">
      <ds-button [mode]="'secondary'" (click)="close()">Close</ds-button>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--gap-large);
      padding: var(--padding-large);
      max-height: 80vh;
      overflow: hidden;
    }

    .modal-header {
      text-align: center;
    }

    .modal-header h2 {
      margin: 0 0 var(--gap-small) 0;
      font-size: 1.75rem;
      font-weight: 700;
    }

    .subtitle {
      margin: 0;
      color: var(--color-text-secondary);
      font-size: var(--text-size-medium);
    }

    .items-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: var(--gap-medium);
      overflow-y: auto;
      padding: var(--padding-small);
      max-height: 50vh;
    }

    .item-wrapper {
      position: relative;
      border: 2px solid transparent;
      border-radius: var(--border-radius);
      padding: var(--padding-small);
      transition: all 0.2s ease;
    }

    .item-wrapper.clickable {
      cursor: pointer;
      border-color: var(--color-border);
    }

    .item-wrapper.clickable:hover {
      border-color: var(--color-primary);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .item-wrapper.claimed {
      opacity: 0.5;
      pointer-events: none;
    }

    .claimed-badge {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 2px solid var(--color-success);
      overflow: hidden;
      background: var(--color-background);
    }

    .player-avatar {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .gm-controls {
      display: flex;
      flex-direction: column;
      gap: var(--gap-small);
      padding: var(--padding-medium);
      background: var(--color-background-secondary);
      border-radius: var(--border-radius);
    }

    .gm-controls label {
      font-weight: 600;
    }

    .player-select {
      padding: var(--padding-small);
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius);
      font-size: var(--text-size-medium);
      background: var(--color-background);
      color: var(--color-text);
    }

    .error-message {
      padding: var(--padding-medium);
      background: var(--color-danger-light, #fee);
      color: var(--color-danger);
      border-radius: var(--border-radius);
      text-align: center;
    }

    .modal-footer {
      display: flex;
      justify-content: center;
      padding-top: var(--padding-medium);
      border-top: 1px solid var(--color-border);
    }
  `],
  imports: [ItemComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LootBoxClaimModalComponent {
  public lootBoxEvent = input.required<EventLootBox>();
  private dialogRef = inject(DialogRef);

  protected currentGameSession = inject(CurrentGameSessionState);
  protected currentParticipant = inject(CurrentParticipantState);
  protected gameEventRepository = inject(GameEventRepository);
  protected eventsCenterState = inject(EventsCenterStateService);

  // Computed signal that gets the latest version of the loot box event from the events list
  protected currentLootBoxEvent = computed(() => {
    const lootBoxId = this.lootBoxEvent().id;
    const latestEvent = this.eventsCenterState.events().find(e => e.event.id === lootBoxId);
    return latestEvent ? (latestEvent.event as EventLootBox) : this.lootBoxEvent();
  });

  protected selectedItem = signal<LootBoxItem | null>(null);
  protected selectedPlayerId = signal<string | null>(null);
  protected errorMessage = signal<string>('');

  protected isGameMaster = computed(() => {
    const participant = this.currentParticipant.currentParticipant();
    return participant ? participant.type === ParticipantType.GameMaster : false;
  });

  protected availablePlayers = computed(() => {
    return this.currentGameSession.currentGameSession().players.filter(player => {
      // Only show players who have at least one eligible inventory
      return player.attributes.inventory.some(inv => 
        !inv.isSecret && inv.capacity.type === 'weight',
      );
    });
  });

  protected canClaim(lootItem: LootBoxItem): boolean {
    if (lootItem.claimedByPlayerId !== null) {
      return false;
    }

    if (this.isGameMaster()) {
      return true; // GM can select any unclaimed item
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

  protected onPlayerSelect(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedPlayerId.set(target.value || null);
  }

  protected onItemClick(lootItem: LootBoxItem): void {
    if (!this.canClaim(lootItem)) {
      return;
    }

    if (this.isGameMaster()) {
      // GM selects item for assignment
      this.selectedItem.set(lootItem);
    } else {
      // Player claims item directly
      this.claimItem(lootItem);
    }
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

  protected assignItemToPlayer(): void {
    const playerId = this.selectedPlayerId();
    const item = this.selectedItem();

    if (!playerId || !item) {
      return;
    }

    const command = {
      type: 'player.loot-box.item.claimed',
      gameSessionId: this.currentGameSession.currentGameSession().id,
      playerId: playerId,
      lootBoxEventId: this.lootBoxEvent().id,
      itemId: item.item.id,
    };

    this.errorMessage.set('');
    this.gameEventRepository.postCommand(command).pipe(
      tap(() => {
        this.selectedItem.set(null);
        this.selectedPlayerId.set(null);
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
}
