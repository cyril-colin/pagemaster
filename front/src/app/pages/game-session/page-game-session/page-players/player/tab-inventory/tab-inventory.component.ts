import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AttributeInventory } from '@pagemaster/common/attributes.types';
import { GameSession, Player } from '@pagemaster/common/pagemaster.types';
import { GameSessionPermissions } from '@pagemaster/common/permissions.types';
import { InventoryComponent } from 'src/app/core/player/inventories/inventory.component';

@Component({
  selector: 'app-tab-player-inventory',
  template: `
    <app-inventory
      [inventory]="inventory()"
      [gameSession]="session()"
      [player]="player()"
      [permissions]="permissions()"
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
  public player = input.required<Player>();
  public session = input.required<GameSession>();
  public permissions = input.required<GameSessionPermissions>();
  
}