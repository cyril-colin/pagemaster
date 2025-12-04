import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { BarsControlComponent } from 'src/app/core/player/bars/bars-control.component';
import { PlayerDataService } from '../player-data.service';
import { TabInventoryComponent } from '../tab-inventory/tab-inventory.component';

@Component({
  selector: 'app-tab-player-details',
  template: `
    

    <app-bars-control
      [player]="playerDataService.viewedPlayer()"
      [permissions]="playerDataService.permissions()"
      [gameSession]="playerDataService.currentSession()!.gameSession"
    />

    @for(i of mediumInventories(); track i.id) {
      <app-tab-player-inventory [inventory]="i" />
    }

    @for(i of smallInventories(); track i.id) {
      <app-tab-player-inventory [inventory]="i" />
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
  imports: [BarsControlComponent, TabInventoryComponent],
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