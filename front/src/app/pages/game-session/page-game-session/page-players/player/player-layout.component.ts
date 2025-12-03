import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Tab, TabsComponent } from 'src/app/core/design-system/tabs.component';
import { PictureControlComponent } from 'src/app/core/player/avatar/picture-control.component';
import { InventoryComponent } from 'src/app/core/player/inventories/inventory.component';
import { NameControlComponent } from 'src/app/core/player/names/name-control.component';
import { PlayerDataService } from './player-data.service';
import { TabDetailsComponent } from './tab-details/tab-details.component';
import { TabNotesComponent } from './tab-notes/tab-notes.component';

@Component({
  selector: 'app-player-layout',
  template: `
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

    <ds-tabs [tabs]="currentTabs()" (tabClick)="onTabClick($event)"/>

    <div class="carousel-container">
      <div class="carousel-track" [style.transform]="'translateX(-' + (selectedTabIndex() * 100) + '%)'">
        <div class="carousel-slide">
          <app-tab-player-details />
        </div>
        @for(i of playerDataService.viewedPlayer().attributes.inventory; track i.id) {
          <div class="carousel-slide">
            <app-inventory
              [inventory]="i"
              [gameSession]="playerDataService.currentSession()!.gameSession"
              [player]="playerDataService.viewedPlayer()"
              [permissions]="playerDataService.permissions()"
            />
          </div>
        }
        <div class="carousel-slide">
          <app-tab-player-notes />
        </div>
      </div>
    </div>
  `,
  styles: [`
    .carousel-container {
      position: relative;
      width: 100%;
      overflow: hidden;
    }

    .carousel-track {
      display: flex;
      transition: transform 0.3s ease-in-out;
      will-change: transform;
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
    InventoryComponent,
  ],
  providers: [
    PlayerDataService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerLayoutComponent {
  protected playerDataService = inject(PlayerDataService);

  protected route = inject(ActivatedRoute);

  protected selectedTab = signal<string>('details');
  
  protected currentTabs = computed(() => {
    return [
      {
        label: 'Details',
        route: ['.', 'details'],
        isActive: this.route.snapshot.url.some(segment => segment.path === 'details'),
      },
      ...this.playerDataService.viewedPlayer().attributes.inventory.map(inv => ({
        label: inv.name,
        route: ['.', inv.id],
        isActive: this.route.snapshot.url.some(segment => segment.path === inv.id),
      })),
      {
        label: 'Notes',
        route: ['.', 'notes'],
        isActive: this.route.snapshot.url.some(segment => segment.path === 'notes'),
      },
    ];
  });

  protected selectedTabIndex = computed(() => {
    const tabs = this.currentTabs();
    const selectedId = this.selectedTab();
    const index = tabs.findIndex(tab => tab.route[tab.route.length - 1] === selectedId);
    return index >= 0 ? index : 0;
  });

  protected onTabClick(tab: Tab) {
    this.selectedTab.set(tab.route[tab.route.length - 1]);
  }
}