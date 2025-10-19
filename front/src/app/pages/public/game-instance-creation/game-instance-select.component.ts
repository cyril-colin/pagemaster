import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { GameDef } from '@pagemaster/common/pagemaster.types';
import { GameDefSelectorComponent } from '../../../core/game/game-def-selector.component';
import { PageMasterRoutes } from '../../../core/pagemaster.router';
import { GameDefService } from '../../../core/repositories/gamedef.service';

@Component({
  selector: 'app-game-instance-select',
  template: `
    <h2>Start a new game session</h2>
    @let games = gameDefs();
    @if (games) {
      <app-game-def-selector [gameDefs]="games" (selectedGameDef)="selectGame($event)"></app-game-def-selector>
    } @else { 
      <p>Loading game definitions...</p>
    }
    
  `,
  styles: [''],
  imports: [
    GameDefSelectorComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameInstanceSelectComponent {
  protected gameDefs = toSignal(inject(GameDefService).getAllGameDefs());
  protected router = inject(Router);

  protected selectGame(gameDef: GameDef) {
    void this.router.navigate([PageMasterRoutes().GameInstanceConfig.interpolated(gameDef.id)]);
  }
}