import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AttributeInventory } from '@pagemaster/common/attributes.types';
import { InventoryComponent } from 'src/app/core/player/inventories/inventory.component';
import { PlayerDataService } from '../player-data.service';

@Component({
  selector: 'app-tab-player-inventory',
  template: `
    <app-inventory
      [inventory]="inventory()"
      [gameSession]="playerDataService.currentSession()!.gameSession"
      [player]="playerDataService.viewedPlayer()"
      [permissions]="playerDataService.permissions()"
    />  
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterModule,
    InventoryComponent,
  ],
})
export class TabInventoryComponent {
  public inventory = input.required<AttributeInventory>();
  protected playerDataService = inject(PlayerDataService);
  protected router = inject(Router);
  protected route = inject(ActivatedRoute);
  
}