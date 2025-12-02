import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabComponent } from 'src/app/core/design-system/tab.component';
import { TabsComponent } from 'src/app/core/design-system/tabs.component';
import { PictureControlComponent } from 'src/app/core/player/avatar/picture-control.component';
import { NameControlComponent } from 'src/app/core/player/names/name-control.component';
import { PlayerDataService } from './player-data.service';

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

    <ds-tabs>
  <ds-tab title="Player">
    <!-- Players content here -->
  </ds-tab>

  <ds-tab title="Inventory">
    <!-- Inventory content here -->
  </ds-tab>

  <ds-tab title="Notes">
    <!-- Notes content here -->
  </ds-tab>
</ds-tabs>
    
    <router-outlet />
  `,
  styles: [
  ],
  imports: [
    RouterModule,
    PictureControlComponent,
    NameControlComponent,
    TabsComponent,
    TabComponent,
  ],
  providers: [
    PlayerDataService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerLayoutComponent {
  protected playerDataService = inject(PlayerDataService);
}