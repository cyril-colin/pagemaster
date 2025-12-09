import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { AttributeStatus } from '@pagemaster/common/attributes.types';
import { EventDiceRoll, EventLootBox } from '@pagemaster/common/events.types';
import { ParticipantType, Player } from '@pagemaster/common/pagemaster.types';
import { tap } from 'rxjs';
import { CurrentGameSessionState } from 'src/app/core/current-game-session.state';
import { CurrentParticipantState } from 'src/app/core/current-participant.state';
import { BottomBarComponent } from 'src/app/core/design-system/bottom-bar.component';
import { ButtonComponent } from 'src/app/core/design-system/button.component';
import {
  DropdownContainerComponent,
  DropdownContentComponent,
  DropdownTriggerComponent,
} from 'src/app/core/design-system/dropdown-container.component';
import { EventMeta, EventsCenterStateService } from 'src/app/core/events-center/events-center.state';
import { LootBoxModalComponent } from 'src/app/core/loot-box/loot-box.modal.component';
import { ModalService } from 'src/app/core/modal';
import { PageMasterRoutes } from 'src/app/core/pagemaster.router';
import { AvatarViewComponent } from 'src/app/core/player/avatar/avatar-view.component';
import { QuickStatusCreationModalComponent } from 'src/app/core/player/statuses/quick-status-creation-modal.component';
import { GameEventRepository } from 'src/app/core/repositories/game-event.repository';
import { GameSessionRepository } from 'src/app/core/repositories/game-session.repository';
import { QuickActionModalComponent } from '../quick-action.modal.component';

@Component({
  selector: 'app-game-session',
  templateUrl: './game-session.page.component.html',
  styleUrls: ['./game-session.page.component.scss'],
  imports: [
    RouterModule,
    ButtonComponent,
    BottomBarComponent,
    DropdownContainerComponent,
    DropdownTriggerComponent,
    DropdownContentComponent,
    AvatarViewComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameSessionPageComponent {
  protected router = inject(Router);
  protected route = inject(ActivatedRoute);
  protected currentGameSession = inject(CurrentGameSessionState);
  protected currentParticipantState = inject(CurrentParticipantState);
  protected modalService = inject(ModalService);
  protected gameEventRepository = inject(GameEventRepository);
  protected gameSessionRepository = inject(GameSessionRepository);
  protected eventsCenterState = inject(EventsCenterStateService);
  protected eventCount = computed(() => this.eventsCenterState.events().filter(e => e.isNew).length);

  protected isGameMaster = computed(() => {
    const participant = this.currentParticipantState.currentParticipant();
    return participant?.type === ParticipantType.GameMaster;
  });

  protected player = computed(() => {
    return this.currentParticipantState.currentParticipant() as Player;
  });

  protected goToPlayerList(): void {
    void this.router.navigate([
      PageMasterRoutes().GameInstanceSession.children[2].path,
    ], { relativeTo: this.route,
    });
  }

  protected goToNotes(): void {
    void this.router.navigate([
      PageMasterRoutes().GameInstanceSession.children[4].path,
    ], { relativeTo: this.route,
    });
  }

  protected async logout(): Promise<void> {
    const response = await this.modalService.confirmation('Are youre sure you want to logout?', 'Logout');
    if (response === 'confirmed') {
      this.currentParticipantState.logout();
    }
  }

  protected showAbout(): void {
    const version = '0.0.0'; // Version from package.json
    void this.modalService.confirmation(
      `PageMaster version ${version}\n\nA real-time collaborative tool for improvised tabletop role-playing games.`,
      'About PageMaster',
    );
  }

  protected goToMyPlayerPage(): void {
    const currentParticipant = this.currentParticipantState.currentParticipant()!;
    if (currentParticipant.type !== 'player') return;

    void this.router.navigate([
      PageMasterRoutes().GameInstanceSession.children[3].interpolated(currentParticipant.id),
    ], { relativeTo: this.route,
    });
  }

  protected lastRunningDiceEvent = computed(() => {
    return this.eventsCenterState.events().reduce<EventMeta<EventDiceRoll> | undefined>((latest, e) => {
      if (e.event.type !== 'dice-roll') return latest;
      if (!latest || e.event.timestamp > latest.event.timestamp) return e as EventMeta<EventDiceRoll>;
      return latest;
    }, undefined);
  });

  protected runDice(faces: number): void {

    const currentParticipant = this.currentParticipantState.currentParticipant()!;

    const event: Omit<EventDiceRoll, 'id' | 'timestamp'> = {
      type: 'dice-roll',
      triggeringPlayerId: currentParticipant.type === 'player' ? currentParticipant.id : null,
      gameSessionId: this.currentGameSession.currentGameSession().id,
      result: Math.floor(Math.random() * faces) + 1,
      sides: faces,
    };
    
    this.gameEventRepository.postCommand(event).subscribe();
  }
  protected goToEvents(): void {
    void this.router.navigate([
      PageMasterRoutes().GameInstanceSession.children[1].path,
    ], { relativeTo: this.route,
    });
  }

  protected runQuickAction(): void {
    const modalRef = this.modalService.open(QuickActionModalComponent);
    modalRef.componentRef.instance.d6.subscribe(() => {
      this.runDice(6);
      void modalRef.close();
    });

    modalRef.componentRef.instance.d20.subscribe(() => {
      this.runDice(20);
      void modalRef.close();
    });

    modalRef.componentRef.instance.cancel.subscribe(() => {
      void modalRef.close();
    });

    modalRef.componentRef.instance.cancel.subscribe(() => {
      void modalRef.close();
    });

    modalRef.componentRef.instance.lootBox.subscribe(() => {
      void modalRef.close();
      this.runLootBox();
    });
  }

  protected runLootBox(): void {
    const modalRef = this.modalService.open(LootBoxModalComponent);
    modalRef.componentRef.instance.cancel.subscribe(() => {
      void modalRef.close();
    });

    modalRef.componentRef.instance.cancel.subscribe(() => {
      void modalRef.close();
    });

    modalRef.componentRef.instance.newLootBox.subscribe((lootBox) => {
      
      const event: Omit<EventLootBox, 'id' | 'timestamp'> = {
        type: 'loot-box',
        gameSessionId: this.currentGameSession.currentGameSession().id,
        lootBox: lootBox,
      };
    
      this.gameEventRepository.postCommand(event).subscribe();
      void modalRef.close();
    });
  }

  protected openCreateQuickStatusModal(): void {
    const modalRef = this.modalService.open(QuickStatusCreationModalComponent);
    
    modalRef.componentRef.instance.quickStatusCreated.subscribe((status: AttributeStatus) => {
      const gameSession = this.currentGameSession.currentGameSession();
      if (gameSession) {
        this.gameSessionRepository.addQuickValueStatus(gameSession.id, status).pipe(
          tap(() => void modalRef.close()),
        ).subscribe();
      }
    });
  }
}