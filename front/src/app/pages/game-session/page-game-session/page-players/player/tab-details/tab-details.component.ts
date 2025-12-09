import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { BarsControlComponent } from 'src/app/core/player/bars/bars-control.component';
import { InventoryMediumComponent } from 'src/app/core/player/inventories/inventory-medium.component';
import { InventorySmallComponent } from 'src/app/core/player/inventories/inventory-small.component';
import { PlayerDataService } from '../player-data.service';

@Component({
  selector: 'app-tab-player-details',
  template: `
    

    <app-bars-control
      [player]="playerDataService.viewedPlayer()"
      [permissions]="playerDataService.permissions()"
      [gameSession]="playerDataService.currentSession()!.gameSession"
    />

    @for(i of mediumInventories(); track i.id) {
      <app-inventory-medium 
        [inventory]="i"
        [player]="playerDataService.viewedPlayer()"
        [gameSession]="playerDataService.currentSession()!.gameSession"
        [permissions]="playerDataService.permissions()"
      />
    }

    @for(i of smallInventories(); track i.id) {
      <app-inventory-small 
        [inventory]="i"
        [player]="playerDataService.viewedPlayer()"
        [gameSession]="playerDataService.currentSession()!.gameSession"
        [permissions]="playerDataService.permissions()"
      />
    }
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--gap-large);
      padding: var(--padding-medium);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BarsControlComponent, InventoryMediumComponent, InventorySmallComponent],
})
export class TabDetailsComponent {
  protected playerDataService = inject(PlayerDataService);


  protected mediumInventories = computed(() => {
    return this.playerDataService.viewedPlayer().attributes.inventory.filter(inv => inv.mode === 'medium');
  });
  
  protected smallInventories = computed(() => {
    return this.playerDataService.viewedPlayer().attributes.inventory.filter(inv => inv.mode === 'small');
  });
}