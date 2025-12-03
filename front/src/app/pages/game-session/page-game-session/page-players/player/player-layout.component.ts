import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { map } from 'rxjs';
import { Tab, TabsComponent } from 'src/app/core/design-system/tabs.component';
import { PictureControlComponent } from 'src/app/core/player/avatar/picture-control.component';
import { NameControlComponent } from 'src/app/core/player/names/name-control.component';
import { PlayerDataService } from './player-data.service';
import { TabDetailsComponent } from './tab-details/tab-details.component';
import { TabInventoryComponent } from './tab-inventory/tab-inventory.component';
import { TabNotesComponent } from './tab-notes/tab-notes.component';

@Component({
  selector: 'app-player-layout',
  template: `
    <div class="fixed-header">
      <app-picture-control
        [player]="playerDataService.viewedPlayer()"
        [gameSession]="playerDataService.currentSession()!.gameSession"
        [permissions]="playerDataService.permissions()"
      />
      <app-name-control
        [player]="playerDataService.viewedPlayer()"
        [gameSession]="playerDataService.currentSession()!.gameSession"
        [permissions]="playerDataService.permissions()"
      />

      <ds-tabs [tabs]="currentTabs()" [fixedLastTab]="true" (tabClick)="onTabClick($event)"/>
    </div>

    <div class="carousel-container">
      <div class="carousel-track" [style.transform]="'translateX(-' + (selectedTabIndex() * 100) + '%)'">
        <div class="carousel-slide">
          <app-tab-player-details />
        </div>
        @for(i of bigInventories(); track i.id) {
          <div class="carousel-slide">
            <app-tab-player-inventory [inventory]="i" />
          </div>
        }
        <div class="carousel-slide">
          <app-tab-player-notes />
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      overflow: hidden;
      position: relative;

      --fixed-header-height-content: 160px;
      --fixed-header-height: calc(var(--header-height) + var(--fixed-header-height-content));
      .fixed-header {
        position: fixed;
        height: var(--fixed-header-height-content);
        top: var(--header-height);
        left: 0;
        right: 0;
        z-index: 50;
        background: var(--color-background-main);
        max-width: var(--content-max-width);
        margin: 0 auto;
        padding: 0 var(--padding-medium);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
      }

      .carousel-container {
        height: 100vh;
        overflow-y: auto;
        overflow-x: hidden;
        padding-top: var(--fixed-header-height-content);
        padding-bottom: var(--footer-height);
      }
    }

    

    .carousel-track {
      display: flex;
      transition: transform 0.3s ease-in-out;
      will-change: transform;
      min-height: calc(100vh - 250px - var(--footer-height));
    }

    .carousel-slide {
      flex: 0 0 100%;
      width: 100%;
      min-width: 100%;
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
  ],
  providers: [
    PlayerDataService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerLayoutComponent {
  protected playerDataService = inject(PlayerDataService);
  protected route = inject(ActivatedRoute);
  protected router = inject(Router);

  // Track the selected tab ID from route parameter
  protected selectedTabId = toSignal(
    this.route.paramMap.pipe(
      map(params => params.get('tabId') ?? 'details'),
    ),
    { initialValue: this.route.snapshot.paramMap.get('tabId') ?? 'details' },
  );

  protected bigInventories = computed(() => {
    return this.playerDataService.viewedPlayer().attributes.inventory.filter(inv => inv.mode === 'large');
  });




  protected currentTabs = computed(() => {
    const selectedId = this.selectedTabId();
    const playerId = this.route.snapshot.paramMap.get('playerId')!;
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
    const selectedId = this.selectedTabId();
    const index = tabs.findIndex(tab => tab.route[tab.route.length - 1] === selectedId);
    return index >= 0 ? index : 0;
  });

  protected onTabClick(tab: Tab) {
    const newTabId = tab.route[tab.route.length - 1];
    // Navigate to sibling route by replacing the tabId parameter
    void this.router.navigate(['..', newTabId], { relativeTo: this.route });
  }
}