import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { GameSession, Player } from '@pagemaster/common/pagemaster.types';
import { GameSessionPermissions } from '@pagemaster/common/permissions.types';
import { BarsControlComponent } from 'src/app/core/player/bars/bars-control.component';
import { InventoryMediumComponent } from 'src/app/core/player/inventories/inventory-medium.component';
import { InventorySmallComponent } from 'src/app/core/player/inventories/inventory-small.component';

@Component({
  selector: 'app-tab-player-details',
  template: `
    

    <app-bars-control
      [player]="player()"
      [permissions]="permissions()"
      [gameSession]="sessions()"
    />

    @for(i of mediumInventories(); track i.id) {
      <app-inventory-medium 
        [inventory]="i"
        [player]="player()"
        [gameSession]="sessions()"
        [permissions]="permissions()"
      />
    }

    @for(i of smallInventories(); track i.id) {
      <app-inventory-small 
        [inventory]="i"
        [player]="player()"
        [gameSession]="sessions()"
        [permissions]="permissions()"
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
  public player = input.required<Player>();
  public permissions = input.required<GameSessionPermissions>();
  public sessions = input.required<GameSession>();

  protected mediumInventories = computed(() => {
    return this.player().attributes.inventory.filter(inv => inv.mode === 'medium');
  });
  
  protected smallInventories = computed(() => {
    return this.player().attributes.inventory.filter(inv => inv.mode === 'small');
  });
}