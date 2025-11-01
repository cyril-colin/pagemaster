import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { GameInstance } from '@pagemaster/common/pagemaster.types';
import { switchMap, tap } from 'rxjs';
import { GameInstanceFormComponent } from '../../../core/game/game-instance-form.component';
import { PageMasterRoutes } from '../../../core/pagemaster.router';
import { GameInstanceRepository } from '../../../core/repositories/game-instance.repository';
import { GameDefRepository } from '../../../core/repositories/gamedef.repository';

@Component({
  selector: 'app-game-instance-config',
  template: `
    <h2>Start a new game session</h2>
    @let game = selectedGameDef();
    @if (game) {
      <app-game-instance-form [gameDef]="game" (newGameInstance)="onNewGame($event)"></app-game-instance-form>
    } @else { 
      <p>Loading game definitions...</p>
    }

    @if (newGameInstance()) {
      <div class="new-game-instance">
        <h3>New Game Instance Created!</h3>
        <p>Your game instance has been successfully created.</p>
        <p><strong>Game Instance ID:</strong> {{ newGameInstance()?.id }}</p>
        <p><strong>Joinable here:</strong> <a [routerLink]="gameInstanceLink()">Link</a></p>
        <p><strong>Game Master:</strong> {{ newGameInstance()?.masterName }}</p>
      </div>
    }
  `,
  styles: [''],
  imports: [
    GameInstanceFormComponent,
    RouterModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameInstanceConfigComponent {
  protected gameDefService = inject(GameDefRepository);
  protected gameInstanceService = inject(GameInstanceRepository);
  protected route = inject(ActivatedRoute);
  protected newGameInstance = signal<GameInstance | null>(null);
  protected gameInstanceLink = signal<string | null>(null);
  protected selectedGameDef = toSignal(this.route.paramMap.pipe(
    switchMap(params => {
      const gameDefId = params.get(PageMasterRoutes().GameInstanceConfig.params[0]);
      if (!gameDefId) {
        throw new Error('No gameDefId in route parameters');
      }
      return this.gameDefService.getGameDefById(gameDefId);
    }),
  ));

  protected onNewGame(gameInstance: GameInstance) {
    this.gameInstanceService.postGameInstance(gameInstance).pipe(
      tap(createdInstance => {
        this.gameInstanceLink.set(`/${PageMasterRoutes().GameInstanceSession.interpolated(createdInstance.id)}`);
        this.newGameInstance.set(createdInstance);
      }),
    ).subscribe();
  }
}
