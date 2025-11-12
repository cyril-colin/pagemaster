import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { GameDef } from '@pagemaster/common/pagemaster.types';
import { GameDefSelectorComponent } from '../../../core/game/game-def-selector.component';
import { PageMasterRoutes } from '../../../core/pagemaster.router';
import { GameDefRepository } from '../../../core/repositories/gamedef.repository';

@Component({
  selector: 'app-game-instance-select',
  template: `
    <div class="container">
      <div class="header">
        <h1>Start a New Game Session</h1>
        <p class="subtitle">Choose your tabletop RPG system to begin your adventure</p>
      </div>
      
      @let games = gameDefs();
      @if (games) {
        <app-game-def-selector [gameDefs]="games" (selectedGameDef)="selectGame($event)"></app-game-def-selector>
      } @else { 
        <div class="loading">
          <p>Loading game systems...</p>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      width: 100%;
      min-height: 100vh;
    }

    .container {
      display: flex;
      flex-direction: column;
      padding: var(--padding-large);
      width: 100%;
      max-width: var(--content-max-width);
      margin: 0 auto;
      gap: var(--gap-xlarge, 32px);
    }

    .header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--gap-small);
      text-align: center;
    }

    h1 {
      color: var(--text-primary);
      font-size: 32px;
      font-weight: var(--text-weight-bold);
      margin: 0;
    }

    .subtitle {
      color: var(--text-secondary);
      font-size: var(--text-size-large);
      margin: 0;
      line-height: 1.5;
    }

    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: var(--padding-large);
      min-height: 200px;
    }

    .loading p {
      color: var(--text-secondary);
      font-size: var(--text-size-medium);
      font-style: italic;
    }

    @media (max-width: 768px) {
      .container {
        padding: var(--padding-medium);
      }

      h1 {
        font-size: 24px;
      }

      .subtitle {
        font-size: var(--text-size-medium);
      }
    }
  `],
  imports: [
    GameDefSelectorComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameInstanceSelectComponent {
  protected gameDefs = toSignal(inject(GameDefRepository).getAllGameDefs());
  protected router = inject(Router);

  protected selectGame(gameDef: GameDef) {
    void this.router.navigate([PageMasterRoutes().GameInstanceConfig.interpolated(gameDef.id)]);
  }
}