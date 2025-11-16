import { ChangeDetectionStrategy, Component, computed, HostListener, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { AttributeBar, AttributeInventory, AttributeStatus } from '@pagemaster/common/attributes.types';
import { Player } from '@pagemaster/common/pagemaster.types';
import { tap } from 'rxjs';
import { AvatarEvent } from 'src/app/core/character/avatar/picture-control.component';
import { CharacterFormComponent } from 'src/app/core/character/character-form.component';
import { InventoryAdditionEvent } from 'src/app/core/character/inventories/inventory-list.component';
import { InventoryDeletionEvent, InventoryItemEvent, InventoryUpdateEvent } from 'src/app/core/character/inventories/inventory.component';
import { CurrentSessionState } from 'src/app/core/current-session.state';
import { PageMasterRoutes } from 'src/app/core/pagemaster.router';
import { GameSessionRepository } from 'src/app/core/repositories/game-session.repository';

@Component({
  selector: 'app-game-player-view',
  template: `
    <app-character-form
      [existingCharacter]="viewedPlayer().character"
      [permissions]="permissions()"
      (renameEvent)="renameParticipant($event.value, viewedPlayer())"
      (avatarEvent)="updateAvatar($event, viewedPlayer())"
      (descriptionEvent)="updateDescription($event.value, viewedPlayer())"
      (newBarValueEvent)="updateBarValue($event, viewedPlayer())"
      (newBarEvent)="addBar($event, viewedPlayer())"
      (editBarEvent)="updateBar($event, viewedPlayer())"
      (deleteBarEvent)="deleteBar($event, viewedPlayer())"
      (newStatusEvent)="addStatus($event, viewedPlayer())"
      (editStatusEvent)="updateStatus($event, viewedPlayer())"
      (deleteStatusEvent)="deleteStatus($event, viewedPlayer())"
      (addItem)="addItemToInventory($event, viewedPlayer())"
      (editItem)="editItemToInventory($event, viewedPlayer())"
      (deleteItem)="deleteItemToInventory($event, viewedPlayer())"
      (addInventory)="addInventory($event, viewedPlayer())"
      (updateInventory)="updateInventory($event, viewedPlayer())"
      (deleteInventory)="deleteInventory($event, viewedPlayer())"
    />
  `,
  styles: [`
    :host {
      display: flex;
      width: 100%;
      justify-content: center;
    }

    app-character-form {
      width: 100%;
      max-width: 800px;
    }
  `],
  imports: [
    CharacterFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerPageComponent {
  protected currentSession = inject(CurrentSessionState);
  protected gameInstanceService = inject(GameSessionRepository);
  protected route = inject(ActivatedRoute);
  protected router = inject(Router);

  protected routeParams = toSignal(this.route.paramMap);

  // Swipe detection state
  private touchStartX = 0;
  private touchEndX = 0;
  private readonly SWIPE_THRESHOLD = 50; // Minimum distance for a swipe

  protected viewedPlayer = computed(() => {
    const paramName = PageMasterRoutes().GameInstanceSession.params[1];
    const playerId = this.routeParams()?.get(paramName);
    if (!playerId) {
      throw new Error('Player ID parameter is missing in the route.');
    }
    const participant = this.currentSession.currentSession().gameSession.participants.find(p => p.id === playerId);
    if (!participant) {
      throw new Error(`Player with ID ${playerId} not found in current game instance.`);
    }
    if (participant.type !== 'player') {
      throw new Error(`Participant with ID ${playerId} is not a player.`);
    }
    return participant;
  });

  protected players = computed(() => {
    return this.currentSession.currentSession().gameSession.participants.filter(
      (p): p is Player => p.type === 'player',
    );
  });

  protected currentPlayerIndex = computed(() => {
    return this.players().findIndex(p => p.id === this.viewedPlayer().id);
  });

  @HostListener('touchstart', ['$event'])
  protected onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0].screenX;
  }

  @HostListener('touchend', ['$event'])
  protected onTouchEnd(event: TouchEvent): void {
    this.touchEndX = event.changedTouches[0].screenX;
    this.handleSwipe();
  }

  protected handleSwipe(): void {
    const swipeDistance = this.touchEndX - this.touchStartX;
    
    if (Math.abs(swipeDistance) < this.SWIPE_THRESHOLD) {
      return; // Not a significant swipe
    }

    if (swipeDistance > 0) {
      // Swipe right - go to previous player
      this.navigateToPreviousPlayer();
    } else {
      // Swipe left - go to next player
      this.navigateToNextPlayer();
    }
  }

  protected navigateToNextPlayer(): void {
    const players = this.players();
    const currentIndex = this.currentPlayerIndex();
    
    if (players.length === 0) return;
    
    const nextIndex = (currentIndex + 1) % players.length;
    const nextPlayer = players[nextIndex];
    
    this.navigateToPlayer(nextPlayer.id);
  }

  protected navigateToPreviousPlayer(): void {
    const players = this.players();
    const currentIndex = this.currentPlayerIndex();
    
    if (players.length === 0) return;
    
    const previousIndex = (currentIndex - 1 + players.length) % players.length;
    const previousPlayer = players[previousIndex];
    
    this.navigateToPlayer(previousPlayer.id);
  }

  protected navigateToPlayer(playerId: string): void {
    const instanceId = this.currentSession.currentSession().gameSession.id;
    const route = PageMasterRoutes().GameInstanceSession;
    const basePath = route.interpolated(instanceId);
    void this.router.navigate([basePath, 'player', playerId]);
  }

  protected permissions = computed(() => {
    const isManager = this.currentSession.allowedToEditCharacterSnapshot();
    const me = this.currentSession.currentSession().participant;
    const isMyPlayer = me.type === 'player' && me.id === this.viewedPlayer().id;
    return {
      avatar: {
        edit: isManager,
      },
      name: {
        edit: isManager,
      },
      description: {
        edit: isManager || isMyPlayer,
      },
      bars: {
        edit: isManager,
        add: isManager,
        delete: isManager,
      },
      statuses: {
        edit: isManager,
        add: isManager,
        delete: isManager,
      },
      inventory: {
        item: {
          add: isManager,
          edit: isManager,
          delete: isManager,
        },
        addition: isManager,
      },
    };
  });

  protected renameParticipant(newName: string, player: Player): void {
    const participantId = player.id;
    const gameSessionId = this.currentSession.currentSession().gameSession.id;
    this.gameInstanceService.renameCharacter(gameSessionId, participantId, { name: newName }).subscribe();
  }

  protected updateAvatar(newAvatar: AvatarEvent, player: Player): void {
    const participantId = player.id;
    const gameSessionId = this.currentSession.currentSession().gameSession.id;
    this.gameInstanceService.updateCharacterAvatar(gameSessionId, participantId, { picture: newAvatar.picture }).pipe(
      tap(() => void newAvatar.modalRef.close()),
    ).subscribe();
  }

  protected updateDescription(newDescription: string, player: Player): void {
    const participantId = player.id;
    const gameSessionId = this.currentSession.currentSession().gameSession.id;
    this.gameInstanceService.updateCharacterDescription(gameSessionId, participantId, { description: newDescription }).subscribe();
  }

  protected updateBarValue(bar: AttributeBar, player: Player): void {
    const participantId = player.id;
    const gameSessionId = this.currentSession.currentSession().gameSession.id;
    this.gameInstanceService.updateCharacterBar(gameSessionId, participantId, bar.id, bar).subscribe();
  }

  protected addBar(bar: AttributeBar, player: Player): void {
    const participantId = player.id;
    const gameSessionId = this.currentSession.currentSession().gameSession.id;
    this.gameInstanceService.addCharacterBar(gameSessionId, participantId, bar).subscribe();
  }

  protected updateBar(bar: AttributeBar, player: Player): void {
    const participantId = player.id;
    const gameSessionId = this.currentSession.currentSession().gameSession.id;
    this.gameInstanceService.updateCharacterBar(gameSessionId, participantId, bar.id, bar).subscribe();
  }

  protected deleteBar(bar: AttributeBar, player: Player): void {
    const participantId = player.id;
    const gameSessionId = this.currentSession.currentSession().gameSession.id;
    this.gameInstanceService.deleteCharacterBar(gameSessionId, participantId, bar.id).subscribe();
  }

  protected addStatus(status: AttributeStatus, player: Player): void {
    const participantId = player.id;
    const gameSessionId = this.currentSession.currentSession().gameSession.id;
    this.gameInstanceService.addCharacterStatus(gameSessionId, participantId, status).subscribe();
  }

  protected updateStatus(status: AttributeStatus, player: Player): void {
    const participantId = player.id;
    const gameSessionId = this.currentSession.currentSession().gameSession.id;
    this.gameInstanceService.updateCharacterStatus(gameSessionId, participantId, status.id, status).subscribe();
  }

  protected deleteStatus(status: AttributeStatus, player: Player): void {
    const participantId = player.id;
    const gameSessionId = this.currentSession.currentSession().gameSession.id;
    this.gameInstanceService.deleteCharacterStatus(gameSessionId, participantId, status.id).subscribe();
  }

  protected updateInventories(inventories: AttributeInventory[], player: Player): void {
    const participantId = player.id;
    const gameSessionId = this.currentSession.currentSession().gameSession.id;
    this.gameInstanceService.updateCharacterInventories(gameSessionId, participantId, { inventory: inventories }).subscribe();
  }

  protected addItemToInventory(itemEvent: InventoryItemEvent, player: Player): void {
    const participantId = player.id;
    const gameSessionId = this.currentSession.currentSession().gameSession.id;
    this.gameInstanceService.addItemToInventory(gameSessionId, participantId, itemEvent.inventory.id, itemEvent.item).pipe(
      tap(() => void itemEvent.modalRef.close()),
    ).subscribe();
  }

  protected editItemToInventory(itemEvent: InventoryItemEvent, player: Player): void {
    const participantId = player.id;
    const gameSessionId = this.currentSession.currentSession().gameSession.id;
    this.gameInstanceService.editItemInInventory(
      gameSessionId, participantId, itemEvent.inventory.id, itemEvent.item).pipe(
      tap(() => void itemEvent.modalRef.close()),
    ).subscribe();
  }

  protected deleteItemToInventory(itemEvent: InventoryItemEvent, player: Player): void {
    const participantId = player.id;
    const gameSessionId = this.currentSession.currentSession().gameSession.id;
    this.gameInstanceService.deleteItemFromInventory(
      gameSessionId, participantId, itemEvent.inventory.id, itemEvent.item.id).pipe(
      tap(() => void itemEvent.modalRef.close()),
    ).subscribe();
  }

  protected addInventory(event: InventoryAdditionEvent, player: Player): void {
    const participantId = player.id;
    const gameSessionId = this.currentSession.currentSession().gameSession.id;
    this.gameInstanceService.addInventoryForCharacter(
      gameSessionId, participantId, event.inventory).pipe(
      tap(() => void event.modalRef.close()),
    ).subscribe();
  }

  protected updateInventory(event: InventoryUpdateEvent, player: Player): void {
    const participantId = player.id;
    const gameSessionId = this.currentSession.currentSession().gameSession.id;
    this.gameInstanceService.updateInventoryForCharacter(
      gameSessionId, participantId, event.inventory.id, event.inventory).pipe(
      tap(() => void event.modalRef.close()),
    ).subscribe();
  }

  protected deleteInventory(event: InventoryDeletionEvent, player: Player): void {
    const participantId = player.id;
    const gameSessionId = this.currentSession.currentSession().gameSession.id;
    this.gameInstanceService.deleteInventoryForCharacter(
      gameSessionId, participantId, event.inventory.id).pipe(
    ).subscribe();
  }
}