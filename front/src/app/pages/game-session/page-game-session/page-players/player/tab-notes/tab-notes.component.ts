import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DescriptionControlComponent } from 'src/app/core/player/descriptions/description-control.component';
import { PlayerDataService } from '../player-data.service';

@Component({
  selector: 'app-tab-player-notes',
  template: `
    <app-description-control
      [description]="playerDataService.viewedPlayer().description"
      [permissions]="playerDataService.permissions().description"
    />
  `,
  styles: [
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DescriptionControlComponent],
})
export class TabNotesComponent {
  protected playerDataService = inject(PlayerDataService);

}