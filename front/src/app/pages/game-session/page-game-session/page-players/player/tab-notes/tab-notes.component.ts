import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Player } from '@pagemaster/common/pagemaster.types';
import { GameSessionPermissions } from '@pagemaster/common/permissions.types';
import { DescriptionControlComponent } from 'src/app/core/player/descriptions/description-control.component';

@Component({
  selector: 'app-tab-player-notes',
  template: `
    <app-description-control
      [description]="player().description"
      [permissions]="permissions().description"
    />
  `,
  styles: [
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DescriptionControlComponent],
})
export class TabNotesComponent {
  public player = input.required<Player>();
  public permissions = input.required<GameSessionPermissions>();

}