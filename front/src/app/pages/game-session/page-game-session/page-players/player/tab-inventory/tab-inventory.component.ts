import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { map } from 'rxjs';
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
  styles: [
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterModule,
    InventoryComponent,
  ],
})
export class TabInventoryComponent {
  protected playerDataService = inject(PlayerDataService);
  protected router = inject(Router);
  protected route = inject(ActivatedRoute);
  protected inventoryId = toSignal(this.route.paramMap.pipe(map (params =>params.get('inventoryId')!)));

  protected inventory = computed(() => {
    const id = this.inventoryId();
    if (!id) {
      throw new Error('No inventory ID provided in route');
    }

    const inventory = this.playerDataService.viewedPlayer().attributes.inventory.find(inv => inv.id === id);
    if (!inventory) {
      void this.router.navigate(['../'], { relativeTo: this.route });
      throw new Error(`Inventory with ID ${id} not found for player`);
    }

    return inventory;
  });
}