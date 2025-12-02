import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { InventoryListComponent } from 'src/app/core/player/inventories/inventory-list.component';
import { PlayerDataService } from '../player-data.service';

@Component({
  selector: 'app-tab-player-inventory',
  template: `
    <app-inventory-list
      [player]="playerDataService.viewedPlayer()"
      [permissions]="playerDataService.permissions()"
      [gameSession]="playerDataService.currentSession()!.gameSession"
    />
  `,
  styles: [
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InventoryListComponent],
})
export class TabInventoryComponent {
  protected playerDataService = inject(PlayerDataService);
}