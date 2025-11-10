import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { AttributeBar, Attributes, AttributeStatus } from '@pagemaster/common/attributes.types';
import { Player } from '@pagemaster/common/pagemaster.types';
import { tap } from 'rxjs';
import { AvatarEvent } from 'src/app/core/character/avatar/picture-control.component';
import { CharacterFormComponent } from 'src/app/core/character/character-form.component';
import { InventoryAdditionEvent } from 'src/app/core/character/inventories/inventory-list.component';
import { InventoryDeletionEvent, InventoryItemEvent } from 'src/app/core/character/inventories/inventory.component';
import { CurrentSessionState } from 'src/app/core/current-session.state';
import { PageMasterRoutes } from 'src/app/core/pagemaster.router';
import { GameInstanceRepository } from 'src/app/core/repositories/game-instance.repository';

@Component({
  selector: 'app-game-player-view',
  template: `
    @let game = currentSession.currentSession().gameInstance;
    <app-character-form
      [existingCharacter]="viewedPlayer().character"
      [gameDef]="game.gameDef"
      [permissions]="permissions()"
      (renameEvent)="renameParticipant($event.value, viewedPlayer())"
      (avatarEvent)="updateAvatar($event, viewedPlayer())"
      (descriptionEvent)="updateDescription($event.value, viewedPlayer())"
      (barsEvent)="updateBars($event, viewedPlayer())"
      (newStatusEvent)="addStatus($event, viewedPlayer())"
      (editStatusEvent)="updateStatus($event, viewedPlayer())"
      (deleteStatusEvent)="deleteStatus($event, viewedPlayer())"
      (addItem)="addItemToInventory($event, viewedPlayer())"
      (editItem)="editItemToInventory($event, viewedPlayer())"
      (deleteItem)="deleteItemToInventory($event, viewedPlayer())"
      (addInventory)="addInventory($event, viewedPlayer())"
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
  protected gameInstanceService = inject(GameInstanceRepository);
  protected route = inject(ActivatedRoute);

  protected routeParams = toSignal(this.route.paramMap);

  protected viewedPlayer = computed(() => {
    const paramName = PageMasterRoutes().GameInstanceSession.params[1];
    const playerId = this.routeParams()?.get(paramName);
    if (!playerId) {
      throw new Error('Player ID parameter is missing in the route.');
    }
    const participant = this.currentSession.currentSession().gameInstance.participants.find(p => p.id === playerId);
    if (!participant) {
      throw new Error(`Player with ID ${playerId} not found in current game instance.`);
    }
    if (participant.type !== 'player') {
      throw new Error(`Participant with ID ${playerId} is not a player.`);
    }
    return participant;
  });

  protected permissions = computed(() => {
    const isManager = this.currentSession.allowedToEditCharacterSnapshot(this.viewedPlayer().character);
    return {
      avatar: {
        edit: isManager,
      },
      name: {
        edit: isManager,
      },
      description: {
        edit: isManager,
      },
      bars: {
        edit: isManager,
      },
      statuses: {
        edit: isManager,
        add: isManager,
        delete: isManager,
      },
      strengths: {
        edit: isManager,
      },
      weaknesses: {
        edit: isManager,
      },
      skills: {
        edit: isManager,
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
    const gameInstanceId = this.currentSession.currentSession().gameInstance.id;
    this.gameInstanceService.renameCharacter(gameInstanceId, participantId, { name: newName }).subscribe();
  }

  protected updateAvatar(newAvatar: AvatarEvent, player: Player): void {
    const participantId = player.id;
    const gameInstanceId = this.currentSession.currentSession().gameInstance.id;
    this.gameInstanceService.updateCharacterAvatar(gameInstanceId, participantId, { picture: newAvatar.picture }).pipe(
      tap(() => void newAvatar.modalRef.close()),
    ).subscribe();
  }

  protected updateDescription(newDescription: string, player: Player): void {
    const participantId = player.id;
    const gameInstanceId = this.currentSession.currentSession().gameInstance.id;
    this.gameInstanceService.updateCharacterDescription(gameInstanceId, participantId, { description: newDescription }).subscribe();
  }

  protected updateBars(bars: AttributeBar[], player: Player): void {
    const participantId = player.id;
    const gameInstanceId = this.currentSession.currentSession().gameInstance.id;
    this.gameInstanceService.updateCharacterBars(gameInstanceId, participantId, { bar: bars }).subscribe();
  }

  protected addStatus(status: AttributeStatus, player: Player): void {
    const participantId = player.id;
    const gameInstanceId = this.currentSession.currentSession().gameInstance.id;
    this.gameInstanceService.addCharacterStatus(gameInstanceId, participantId, status).subscribe();
  }

  protected updateStatus(status: AttributeStatus, player: Player): void {
    const participantId = player.id;
    const gameInstanceId = this.currentSession.currentSession().gameInstance.id;
    this.gameInstanceService.updateCharacterStatus(gameInstanceId, participantId, status.id, status).subscribe();
  }

  protected deleteStatus(status: AttributeStatus, player: Player): void {
    const participantId = player.id;
    const gameInstanceId = this.currentSession.currentSession().gameInstance.id;
    this.gameInstanceService.deleteCharacterStatus(gameInstanceId, participantId, status.id).subscribe();
  }

  protected updateInventories(inventories: Attributes['inventory']['instance'][], player: Player): void {
    const participantId = player.id;
    const gameInstanceId = this.currentSession.currentSession().gameInstance.id;
    this.gameInstanceService.updateCharacterInventories(gameInstanceId, participantId, { inventory: inventories }).subscribe();
  }

  protected addItemToInventory(itemEvent: InventoryItemEvent, player: Player): void {
    const participantId = player.id;
    const gameInstanceId = this.currentSession.currentSession().gameInstance.id;
    this.gameInstanceService.addItemToInventory(gameInstanceId, participantId, itemEvent.inventory.instance.id, itemEvent.item).pipe(
      tap(() => void itemEvent.modalRef.close()),
    ).subscribe();
  }

  protected editItemToInventory(itemEvent: InventoryItemEvent, player: Player): void {
    const participantId = player.id;
    const gameInstanceId = this.currentSession.currentSession().gameInstance.id;
    this.gameInstanceService.editItemInInventory(
      gameInstanceId, participantId, itemEvent.inventory.instance.id, itemEvent.item).pipe(
      tap(() => void itemEvent.modalRef.close()),
    ).subscribe();
  }

  protected deleteItemToInventory(itemEvent: InventoryItemEvent, player: Player): void {
    const participantId = player.id;
    const gameInstanceId = this.currentSession.currentSession().gameInstance.id;
    this.gameInstanceService.deleteItemFromInventory(
      gameInstanceId, participantId, itemEvent.inventory.instance.id, itemEvent.item.id).pipe(
      tap(() => void itemEvent.modalRef.close()),
    ).subscribe();
  }

  protected addInventory(event: InventoryAdditionEvent, player: Player): void {
    const participantId = player.id;
    const gameInstanceId = this.currentSession.currentSession().gameInstance.id;
    this.gameInstanceService.addInventoryForCharacter(
      gameInstanceId, participantId, event.inventory.def.id).pipe(
      tap(() => void event.modalRef.close()),
    ).subscribe();
  }

  protected deleteInventory(event: InventoryDeletionEvent, player: Player): void {
    const participantId = player.id;
    const gameInstanceId = this.currentSession.currentSession().gameInstance.id;
    this.gameInstanceService.deleteInventoryForCharacter(
      gameInstanceId, participantId, event.inventory.instance.id).pipe(
    ).subscribe();
  }
}