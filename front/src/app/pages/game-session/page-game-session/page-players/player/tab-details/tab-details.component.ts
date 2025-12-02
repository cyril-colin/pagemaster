import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BarsControlComponent } from 'src/app/core/player/bars/bars-control.component';
import { StatusControlComponent } from 'src/app/core/player/statuses/status-control.component';
import { PlayerDataService } from '../player-data.service';

@Component({
  selector: 'app-tab-player-details',
  template: `
    <app-status-control
      [player]="playerDataService.viewedPlayer()"
      [permissions]="playerDataService.permissions()"
      [gameSession]="playerDataService.currentSession()!.gameSession"
    />

    <app-bars-control
      [player]="playerDataService.viewedPlayer()"
      [permissions]="playerDataService.permissions()"
      [gameSession]="playerDataService.currentSession()!.gameSession"
    />
  `,
  styles: [
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StatusControlComponent, BarsControlComponent],
})
export class TabDetailsComponent {
  protected playerDataService = inject(PlayerDataService);
}