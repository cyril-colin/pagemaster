import { ChangeDetectionStrategy, Component, computed, HostListener, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { AttributeBar, AttributeStatus } from '@pagemaster/common/attributes.types';
import {
  EventPlayerAvatarEdit,
  EventPlayerBarAdd,
  EventPlayerBarDelete,
  EventPlayerBarEdit,
  EventPlayerDescriptionEdit,
  EventPlayerInventoryAdd,
  EventPlayerInventoryDelete,
  EventPlayerInventoryItemAdd,
  EventPlayerInventoryItemDelete,
  EventPlayerInventoryItemEdit,
  EventPlayerInventoryUpdate,
  EventPlayerNameEdit,
  EventPlayerStatusAdd,
  EventPlayerStatusDelete,
  EventPlayerStatusEdit,
  EventPlayerTypes,
} from '@pagemaster/common/events-player.types';
import { Player } from '@pagemaster/common/pagemaster.types';
import { tap } from 'rxjs';
import { CurrentGameSessionState } from 'src/app/core/current-game-session.state';
import { CurrentParticipantState } from 'src/app/core/current-participant.state';
import { PageMasterRoutes } from 'src/app/core/pagemaster.router';
import { AvatarEvent } from 'src/app/core/player/avatar/picture-control.component';
import { InventoryAdditionEvent } from 'src/app/core/player/inventories/inventory-list.component';
import { InventoryDeletionEvent, InventoryItemEvent, InventoryUpdateEvent } from 'src/app/core/player/inventories/inventory.component';
import { PlayerFormComponent } from 'src/app/core/player/player-form.component';
import { GameEventRepository } from 'src/app/core/repositories/game-event.repository';

@Component({
  selector: 'app-game-player-view',
  template: `
    <app-player-form
      [existingPlayer]="viewedPlayer()"
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

    app-player-form {
      width: 100%;
      max-width: 800px;
    }
  `],
  imports: [
    PlayerFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerPageComponent {
  protected gameSession = inject(CurrentGameSessionState);
  protected participant = inject(CurrentParticipantState);
  protected currentSession = computed(() => {
    const gameSession = this.gameSession.currentGameSessionNullable();
    const participant = this.participant.currentParticipant();
    if (gameSession && participant) {
      return { gameSession, participant };
    }
    return null;
  });
  protected currentParticipantState = inject(CurrentParticipantState);
  protected gameEventRepository = inject(GameEventRepository);
  protected route = inject(ActivatedRoute);
  protected router = inject(Router);

  protected routeParams = toSignal(this.route.paramMap);

  

  // Swipe detection state
  private touchStartX = 0;
  private touchEndX = 0;
  private readonly SWIPE_THRESHOLD = 50; // Minimum distance for a swipe
  protected players = computed(() => {
    return this.currentSession()!.gameSession.players;
  });

  protected viewedPlayer = computed(() => {
    const paramName = PageMasterRoutes().GameInstanceSession.params[1];
    const playerId = this.routeParams()?.get(paramName);
    if (!playerId) {
      throw new Error('Player ID parameter is missing in the route.');
    }
    const participant = this.players().find(p => p.id === playerId);
    if (!participant) {
      throw new Error(`Player with ID ${playerId} not found in current game instance.`);
    }
    return participant;
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
    const instanceId = this.currentSession()!.gameSession.id;
    const route = PageMasterRoutes().GameInstanceSession;
    const basePath = route.interpolated(instanceId);
    void this.router.navigate([basePath, 'player', playerId]);
  }

  protected permissions = computed(() => {
    const isManager = this.currentParticipantState.allowedToEditPlayerSnapshot();
    const me = this.currentSession()!.participant;
    const isMyPlayer = me.id === this.viewedPlayer().id;
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
    const gameSessionId = this.currentSession()!.gameSession.id;

    const command: Omit<EventPlayerNameEdit, 'id'> = {
      type: EventPlayerTypes.PLAYER_NAME_EDIT,
      gameSessionId,
      playerId: player.id,
      newName: newName,
      timestamp: Date.now(),
    };

    this.gameEventRepository.postCommand(command).subscribe();
  }

  protected updateAvatar(newAvatar: AvatarEvent, player: Player): void {
    const gameSessionId = this.currentSession()!.gameSession.id;

    const command: Omit<EventPlayerAvatarEdit, 'id'> = {
      type: EventPlayerTypes.PLAYER_AVATAR_EDIT,
      gameSessionId,
      playerId: player.id,
      newAvatar: newAvatar.picture,
      timestamp: Date.now(),
    };

    this.gameEventRepository.postCommand(command).pipe(
      tap(() => void newAvatar.modalRef.close()),
    ).subscribe();
  }

  protected updateDescription(newDescription: string, player: Player): void {
    const gameSessionId = this.currentSession()!.gameSession.id;

    const command: Omit<EventPlayerDescriptionEdit, 'id'> = {
      type: EventPlayerTypes.PLAYER_DESCRIPTION_EDIT,
      gameSessionId,
      playerId: player.id,
      newDescription,
      timestamp: Date.now(),
    };

    this.gameEventRepository.postCommand(command).subscribe();
  }

  protected updateBarValue(bar: AttributeBar, player: Player): void {
    const gameSessionId = this.currentSession()!.gameSession.id;

    const command: Omit<EventPlayerBarEdit, 'id'> = {
      type: EventPlayerTypes.PLAYER_BAR_EDIT,
      gameSessionId,
      playerId: player.id,
      newBar: bar,
      timestamp: Date.now(),
    };

    this.gameEventRepository.postCommand(command).subscribe();
  }

  protected addBar(bar: AttributeBar, player: Player): void {
    const gameSessionId = this.currentSession()!.gameSession.id;

    const command: Omit<EventPlayerBarAdd, 'id'> = {
      type: EventPlayerTypes.PLAYER_BAR_ADD,
      gameSessionId,
      playerId: player.id,
      newBar: bar,
      timestamp: Date.now(),
    };

    this.gameEventRepository.postCommand(command).subscribe();
  }

  protected updateBar(bar: AttributeBar, player: Player): void {
    const gameSessionId = this.currentSession()!.gameSession.id;

    const command: Omit<EventPlayerBarEdit, 'id'> = {
      type: EventPlayerTypes.PLAYER_BAR_EDIT,
      gameSessionId,
      playerId: player.id,
      newBar: bar,
      timestamp: Date.now(),
    };

    this.gameEventRepository.postCommand(command).subscribe();
  }

  protected deleteBar(bar: AttributeBar, player: Player): void {
    const gameSessionId = this.currentSession()!.gameSession.id;

    const command: Omit<EventPlayerBarDelete, 'id'> = {
      type: EventPlayerTypes.PLAYER_BAR_DELETE,
      gameSessionId,
      playerId: player.id,
      barId: bar.id,
      timestamp: Date.now(),
    };

    this.gameEventRepository.postCommand(command).subscribe();
  }

  protected addStatus(status: AttributeStatus, player: Player): void {
    const gameSessionId = this.currentSession()!.gameSession.id;

    const command: Omit<EventPlayerStatusAdd, 'id'> = {
      type: EventPlayerTypes.PLAYER_STATUS_ADD,
      gameSessionId,
      playerId: player.id,
      newStatus: status,
      timestamp: Date.now(),
    };

    this.gameEventRepository.postCommand(command).subscribe();
  }

  protected updateStatus(status: AttributeStatus, player: Player): void {
    const gameSessionId = this.currentSession()!.gameSession.id;

    const command: Omit<EventPlayerStatusEdit, 'id'> = {
      type: EventPlayerTypes.PLAYER_STATUS_EDIT,
      gameSessionId,
      playerId: player.id,
      newStatus: status,
      timestamp: Date.now(),
    };

    this.gameEventRepository.postCommand(command).subscribe();
  }

  protected deleteStatus(status: AttributeStatus, player: Player): void {
    const gameSessionId = this.currentSession()!.gameSession.id;

    const command: Omit<EventPlayerStatusDelete, 'id'> = {
      type: EventPlayerTypes.PLAYER_STATUS_DELETE,
      gameSessionId,
      playerId: player.id,
      statusId: status.id,
      timestamp: Date.now(),
    };

    this.gameEventRepository.postCommand(command).subscribe();
  }

  protected addItemToInventory(itemEvent: InventoryItemEvent, player: Player): void {
    const gameSessionId = this.currentSession()!.gameSession.id;

    const command: Omit<EventPlayerInventoryItemAdd, 'id'> = {
      type: EventPlayerTypes.PLAYER_INVENTORY_ITEM_ADD,
      gameSessionId,
      playerId: player.id,
      inventoryId: itemEvent.inventory.id,
      newItem: itemEvent.item,
      timestamp: Date.now(),
    } ;

    this.gameEventRepository.postCommand(command).pipe(
      tap(() => void itemEvent.modalRef.close()),
    ).subscribe();
  }

  protected editItemToInventory(itemEvent: InventoryItemEvent, player: Player): void {
    const gameSessionId = this.currentSession()!.gameSession.id;

    const command: Omit<EventPlayerInventoryItemEdit, 'id'> = {
      type: EventPlayerTypes.PLAYER_INVENTORY_ITEM_EDIT,
      gameSessionId,
      playerId: player.id,
      inventoryId: itemEvent.inventory.id,
      newItem: itemEvent.item,
      timestamp: Date.now(),
    };

    this.gameEventRepository.postCommand(command).pipe(
      tap(() => void itemEvent.modalRef.close()),
    ).subscribe();
  }

  protected deleteItemToInventory(itemEvent: InventoryItemEvent, player: Player): void {
    const gameSessionId = this.currentSession()!.gameSession.id;

    const command: Omit<EventPlayerInventoryItemDelete, 'id'> = {
      type: EventPlayerTypes.PLAYER_INVENTORY_ITEM_DELETE,
      gameSessionId,
      playerId: player.id,
      inventoryId: itemEvent.inventory.id,
      deletedItem: itemEvent.item,
      timestamp: Date.now(),
    };

    this.gameEventRepository.postCommand(command).pipe(
      tap(() => void itemEvent.modalRef.close()),
    ).subscribe();
  }

  protected addInventory(event: InventoryAdditionEvent, player: Player): void {
    const gameSessionId = this.currentSession()!.gameSession.id;

    const command: Omit<EventPlayerInventoryAdd, 'id'> = {
      type: EventPlayerTypes.PLAYER_INVENTORY_ADD,
      gameSessionId,
      playerId: player.id,
      newInventory: event.inventory,
      timestamp: Date.now(),
    };

    this.gameEventRepository.postCommand(command).pipe(
      tap(() => void event.modalRef.close()),
    ).subscribe();
  }

  protected updateInventory(event: InventoryUpdateEvent, player: Player): void {
    const gameSessionId = this.currentSession()!.gameSession.id;

    const command: Omit<EventPlayerInventoryUpdate, 'id'> = {
      type: EventPlayerTypes.PLAYER_INVENTORY_UPDATE,
      gameSessionId,
      playerId: player.id,
      newInventory: event.inventory,
      timestamp: Date.now(),
    };

    this.gameEventRepository.postCommand(command).pipe(
      tap(() => void event.modalRef.close()),
    ).subscribe();
  }

  protected deleteInventory(event: InventoryDeletionEvent, player: Player): void {
    const gameSessionId = this.currentSession()!.gameSession.id;

    const command: Omit<EventPlayerInventoryDelete, 'id' | 'timestamp'> = {
      type: EventPlayerTypes.PLAYER_INVENTORY_DELETE,
      gameSessionId,
      playerId: player.id,
      inventoryId: event.inventory.id,
    };

    this.gameEventRepository.postCommand(command).subscribe();
  }
}