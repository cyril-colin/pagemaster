import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AttributeBar } from '@pagemaster/common/attributes.types';
import { EventPlayerBarAdd, EventPlayerBarDelete, EventPlayerTypes } from '@pagemaster/common/events-player.types';
import { forkJoin, tap } from 'rxjs';
import { SmartRoutes } from 'src/app/app.routes';
import { CurrentGameSessionState } from 'src/app/core/current-game-session.state';
import { ButtonComponent } from 'src/app/core/design-system/button.component';
import {
  DropdownContainerComponent,
  DropdownContentComponent,
  DropdownTriggerComponent,
} from 'src/app/core/design-system/dropdown-container.component';
import { Tab, TabsComponent } from 'src/app/core/design-system/tabs.component';
import { ModalService } from 'src/app/core/modal';
import { PictureControlComponent } from 'src/app/core/player/avatar/picture-control.component';
import { BarSelectorModalComponent } from 'src/app/core/player/bars/bar-selector-modal.component';
import { InventoryFormModalComponent } from 'src/app/core/player/inventories/inventory-form-modal.component';
import { NameControlComponent } from 'src/app/core/player/names/name-control.component';
import { StatusControlComponent } from 'src/app/core/player/statuses/status-control.component';
import { GameEventRepository } from 'src/app/core/repositories/game-event.repository';
import { GameSessionRepository } from 'src/app/core/repositories/game-session.repository';
import { PlayerDataService } from './player-data.service';
import { TabDetailsComponent } from './tab-details/tab-details.component';
import { TabInventoryComponent } from './tab-inventory/tab-inventory.component';
import { TabNotesComponent } from './tab-notes/tab-notes.component';

@Component({
  selector: 'app-player-layout',
  template: `
    
    <section class="head">
      <ds-button [mode]="'mini'" [icon]="'arrow-left'" (click)="goBack()" />
      <section class="identity">
        <app-picture-control
          [player]="playerDataService.viewedPlayer(this.playerId())()"
          [gameSession]="playerDataService.currentSession()!.gameSession"
          [permissions]="playerDataService.permissions(this.playerId())()"
        />
        <app-name-control
          [player]="playerDataService.viewedPlayer(this.playerId())()"
          [gameSession]="playerDataService.currentSession()!.gameSession"
          [permissions]="playerDataService.permissions(this.playerId())()"
        />

        <app-status-control
          [player]="playerDataService.viewedPlayer(this.playerId())()"
          [permissions]="playerDataService.permissions(this.playerId())()"
          [gameSession]="playerDataService.currentSession()!.gameSession"
        />
      </section>
      <ds-dropdown-container>
        <ds-dropdown-trigger>
          <ds-button [mode]="'mini'" [icon]="'settings'" />
        </ds-dropdown-trigger>
        <ds-dropdown-content>
          <ds-button [mode]="'tertiary'" [icon]="'plus'" (click)="openAddBarModal()" >Add bar</ds-button>
          <ds-button [mode]="'tertiary'" [icon]="'plus'" (click)="openAddInventoryModal()" >Add inventory</ds-button>
          <ds-button [mode]="'tertiary'" [icon]="'trash'" (click)="deletePlayer()" >Delete player</ds-button>
        </ds-dropdown-content>
      </ds-dropdown-container>
    </section>
    
    <ds-tabs [tabs]="currentTabs()" [fixedLastTab]="true" (tabClick)="onTabClick($event)"/>
    <div class="carousel-container">
      <div class="carousel-track" [style.transform]="'translateX(-' + (selectedTabIndex() * 100) + '%)'">
        <div class="carousel-slide">
          <app-tab-player-details
            [player]="player()"
            [permissions]="permissions()"
            [sessions]="sessions()"
          />
        </div>
        @for(i of bigInventories(); track i.id) {
          <div class="carousel-slide">
            <app-tab-player-inventory
              [inventory]="i"
              [player]="player()"
              [session]="sessions()"
              [permissions]="permissions()"
            />
          </div>
        }
        <div class="carousel-slide">
          <app-tab-player-notes
            [player]="player()"
            [permissions]="permissions()"
          />
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;

      .head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
      }

      --identity-height: 180px;
      .identity {
        display: flex;
        width: 100%;
        height: var(--identity-height);
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
      }

      .carousel-container {
        height: 100%;
        overflow-y: auto;
        overflow-x: hidden;
        margin-top: var(--gap-large);
        padding-bottom: var(--footer-height);
      }

      .carousel-track {
        display: flex;
        transition: transform 0.3s ease-in-out;
      }

      .carousel-slide {
        flex: 0 0 100%;
        width: 100%;
      }
    }
  `],
  imports: [
    RouterModule,
    PictureControlComponent,
    NameControlComponent,
    TabsComponent,
    TabDetailsComponent,
    TabNotesComponent,
    TabInventoryComponent,
    StatusControlComponent,
    ButtonComponent,
    DropdownContainerComponent,
    DropdownTriggerComponent,
    DropdownContentComponent,
  ],
  providers: [
    PlayerDataService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerLayoutComponent {
  readonly playerId = input.required<string>();
  readonly tabId = input.required<string>();
  
  protected playerDataService = inject(PlayerDataService);
  protected route = inject(ActivatedRoute);
  protected router = inject(Router);
  protected modalService = inject(ModalService);
  private currentGameSession = inject(CurrentGameSessionState);
  private gameSessionRepository = inject(GameSessionRepository);
  private gameEventRepository = inject(GameEventRepository);

  protected player = computed(() => {
    return this.playerDataService.viewedPlayer(this.playerId())();
  });

  protected permissions = computed(() => {
    return this.playerDataService.permissions(this.playerId())();
  });

  protected sessions = computed(() => {
    return this.playerDataService.currentSession()!.gameSession;
  });

  protected bigInventories = computed(() => {
    return this.playerDataService.viewedPlayer(this.playerId())().attributes.inventory.filter(inv => inv.mode === 'large');
  });

  protected goBack() {
    void this.router.navigate([
      '',
      ...SmartRoutes.gameInstanceSession.path(this.playerDataService.currentSession()!.gameSession.id),
      ...SmartRoutes.gameInstanceSession.children.players.path(),
    ]);
  }




  protected currentTabs = computed(() => {
    const selectedId = this.tabId();
    const playerId = this.playerId();
    return [
      {
        label: 'Details',
        route: ['..', playerId, 'details'],
        isActive: selectedId === 'details',
      },
      ...this.bigInventories().map(inv => ({
        label: inv.name,
        route: ['..', playerId, inv.id],
        isActive: selectedId === inv.id,
      })),
      {
        label: 'Notes',
        route: ['..', playerId, 'notes'],
        isActive: selectedId === 'notes',
      },
    ];
  });

  protected selectedTabIndex = computed(() => {
    const tabs = this.currentTabs();
    const selectedId = this.tabId();
    const index = tabs.findIndex(tab => tab.route[tab.route.length - 1] === selectedId);
    return index >= 0 ? index : 0;
  });

  protected onTabClick(tab: Tab) {
    const newTabId = tab.route[tab.route.length - 1];
    // Navigate to sibling route by replacing the tabId parameter
    void this.router.navigate(['..', newTabId], { relativeTo: this.route });
  }

  protected openAddInventoryModal() {
    this.modalService.open(InventoryFormModalComponent, {
      gameSession: this.playerDataService.currentSession()!.gameSession,
      player: this.playerDataService.viewedPlayer(this.playerId())(),
      permissions: this.playerDataService.permissions(this.playerId())(),
    });
  }

  protected openAddBarModal() {
    const gameSession = this.playerDataService.currentSession()!.gameSession;
    const player = this.playerDataService.viewedPlayer(this.playerId())();
    const quickBars = (gameSession.quickValues?.bars || []);
    const alreadyAddedIds = player.attributes.bar.map(b => b.id);

    const modalRef = this.modalService.open(BarSelectorModalComponent, {
      availableBars: quickBars,
      alreadyAddedBarIds: alreadyAddedIds,
    });

    modalRef.componentRef.instance.barsSelected.subscribe((newBars: AttributeBar[]) => {
      // Replace all bars: remove old ones, add new ones
      const barsToRemove = alreadyAddedIds.filter(id => !newBars.find(b => b.id === id));
      const barsToAdd = newBars.filter(b => !alreadyAddedIds.includes(b.id));
      
      const requests = [];
      
      // Add bulk delete request if there are bars to remove
      if (barsToRemove.length > 0) {
        requests.push(this.deleteBars(barsToRemove, player.id, gameSession.id));
      }
      
      // Add bulk add request if there are bars to add
      if (barsToAdd.length > 0) {
        requests.push(this.addBars(barsToAdd, player.id, gameSession.id));
      }
      
      if (requests.length > 0) {
        forkJoin(requests).pipe(
          tap(() => void modalRef.close()),
        ).subscribe();
      } else {
        void modalRef.close();
      }
    });
  }

  private addBars(bars: AttributeBar[], playerId: string, gameSessionId: string) {
    const command: Omit<EventPlayerBarAdd, 'id' | 'timestamp'> = {
      type: EventPlayerTypes.PLAYER_BAR_ADD,
      gameSessionId,
      playerId,
      newBars: bars,
    };

    return this.gameEventRepository.postCommand(command);
  }

  private deleteBars(barIds: string[], playerId: string, gameSessionId: string) {
    const command: Omit<EventPlayerBarDelete, 'id' | 'timestamp'> = {
      type: EventPlayerTypes.PLAYER_BAR_DELETE,
      gameSessionId,
      playerId,
      barIds: barIds,
    };

    return this.gameEventRepository.postCommand(command);
  }

  protected async deletePlayer(): Promise<void> {
    const player = this.playerDataService.viewedPlayer(this.playerId())();
    const title = `Delete Player "${player.name}"`;
    const description = 'This action cannot be undone.';
    const confirmation = await this.modalService.confirmation(description, title);
    
    if (confirmation === 'confirmed') {
      const gameSession = this.currentGameSession.currentGameSession();
      if (gameSession) {
        this.gameSessionRepository.deleteParticipant(gameSession.id, player.id).pipe(
          tap(() => void this.goBack()),
        ).subscribe();
      }
    }
  }
}