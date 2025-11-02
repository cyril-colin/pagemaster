import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Attributes } from '@pagemaster/common/attributes.types';
import { Player } from '@pagemaster/common/pagemaster.types';
import { tap } from 'rxjs';
import { AvatarEvent } from 'src/app/core/character/avatar/picture-control.component';
import { Bar } from 'src/app/core/character/bars/bars-control.component';
import { CharacterFormComponent } from 'src/app/core/character/character-form.component';
import { InventoryItemEvent, InventorySelectionEvent } from 'src/app/core/character/inventories/inventory-list.component';
import { Skill } from 'src/app/core/character/skills/skills-control.component';
import { Status } from 'src/app/core/character/statuses/status-control.component';
import { Strength } from 'src/app/core/character/strengths/strengths-control.component';
import { Weakness } from 'src/app/core/character/weaknesses/weaknesses-control.component';
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
      (statusesEvent)="updateStatuses($event, viewedPlayer())"
      (strengthsEvent)="updateStrengths($event, viewedPlayer())"
      (weaknessesEvent)="updateWeaknesses($event, viewedPlayer())"
      (skillsEvent)="updateSkills($event, viewedPlayer())"
      (addItem)="addItemToInventory($event, viewedPlayer())"
      (editItem)="editItemToInventory($event, viewedPlayer())"
      (deleteItem)="deleteItemToInventory($event, viewedPlayer())"
      (select)="selectInventory($event, viewedPlayer())"
      (unselect)="unselectInventory($event, viewedPlayer())"
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
        selection: isManager,
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
      tap(() => newAvatar.modalRef.close()),
    ).subscribe();
  }

  protected updateDescription(newDescription: string, player: Player): void {
    const participantId = player.id;
    const gameInstanceId = this.currentSession.currentSession().gameInstance.id;
    this.gameInstanceService.updateCharacterDescription(gameInstanceId, participantId, { description: newDescription }).subscribe();
  }

  protected updateBars(bars: Bar[], player: Player): void {
    const participantId = player.id;
    const gameInstanceId = this.currentSession.currentSession().gameInstance.id;
    const selectedBars = bars.filter(b => b.selected).map(b => b.instance);
    this.gameInstanceService.updateCharacterBars(gameInstanceId, participantId, { bar: selectedBars }).subscribe();
  }

  protected updateStatuses(statuses: Status[], player: Player): void {
    const participantId = player.id;
    const gameInstanceId = this.currentSession.currentSession().gameInstance.id;
    const selectedStatuses = statuses.filter(s => s.selected).map(s => s.instance);
    this.gameInstanceService.updateCharacterStatuses(gameInstanceId, participantId, { status: selectedStatuses }).subscribe();
  }

  protected updateStrengths(strengths: Strength[], player: Player): void {
    const participantId = player.id;
    const gameInstanceId = this.currentSession.currentSession().gameInstance.id;
    const selectedStrengths = strengths.filter(s => s.selected).map(s => s.instance);
    this.gameInstanceService.updateCharacterStrengths(gameInstanceId, participantId, { strength: selectedStrengths }).subscribe();
  }

  protected updateWeaknesses(weaknesses: Weakness[], player: Player): void {
    const participantId = player.id;
    const gameInstanceId = this.currentSession.currentSession().gameInstance.id;
    const selectedWeaknesses = weaknesses.filter(w => w.selected).map(w => w.instance);
    this.gameInstanceService.updateCharacterWeaknesses(gameInstanceId, participantId, { weakness: selectedWeaknesses }).subscribe();
  }

  protected updateSkills(skills: Skill[], player: Player): void {
    const participantId = player.id;
    const gameInstanceId = this.currentSession.currentSession().gameInstance.id;
    const selectedSkills = skills.filter(s => s.selected).map(s => s.instance);
    this.gameInstanceService.updateCharacterSkills(gameInstanceId, participantId, { skills: selectedSkills }).subscribe();
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
      tap(() => itemEvent.modalRef.close()),
    ).subscribe();
  }

  protected editItemToInventory(itemEvent: InventoryItemEvent, player: Player): void {
    const participantId = player.id;
    const gameInstanceId = this.currentSession.currentSession().gameInstance.id;
    this.gameInstanceService.editItemInInventory(
      gameInstanceId, participantId, itemEvent.inventory.instance.id, itemEvent.item).pipe(
      tap(() => itemEvent.modalRef.close()),
    ).subscribe();
  }

  protected deleteItemToInventory(itemEvent: InventoryItemEvent, player: Player): void {
    const participantId = player.id;
    const gameInstanceId = this.currentSession.currentSession().gameInstance.id;
    this.gameInstanceService.deleteItemFromInventory(
      gameInstanceId, participantId, itemEvent.inventory.instance.id, itemEvent.item.id).pipe(
      tap(() => itemEvent.modalRef.close()),
    ).subscribe();
  }

  protected selectInventory(event: InventorySelectionEvent, player: Player): void {
    const participantId = player.id;
    const gameInstanceId = this.currentSession.currentSession().gameInstance.id;
    this.gameInstanceService.selectInventoryForCharacter(
      gameInstanceId, participantId, event.inventory.instance.id).pipe(
      tap(() => event.modalRef.close()),
    ).subscribe();
  }

  protected unselectInventory(event: InventorySelectionEvent, player: Player): void {
    const participantId = player.id;
    const gameInstanceId = this.currentSession.currentSession().gameInstance.id;
    this.gameInstanceService.unselectInventoryForCharacter(
      gameInstanceId, participantId, event.inventory.instance.id).pipe(
      tap(() => event.modalRef.close()),
    ).subscribe();
  }
}