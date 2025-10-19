import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { MainTitleService } from 'src/app/core/main-bar/main-title.service';
import { PageMasterRoutes } from '../../core/pagemaster.router';
import { GameInstanceService } from '../../core/repositories/game-instance.service';

@Component({
  selector: 'app-home',
  template: `
    <h1>Welcome to PageMaster</h1>
    <ul>
      <li><a [routerLink]="'/' + routes.GameInstanceSelect.path">New session</a></li>
      <li><a [routerLink]="'/' + routes.GameInstanceJoin.path">Join existing session with link</a></li>
      <li><a [routerLink]="'/' + routes.GameInstanceLoad.path">Load existing session from file</a></li>
      <li><a [routerLink]="'/' + routes.GameDefNew.path">Define a new game</a></li>
    </ul>

    <h2>Existing Game Instances</h2>
    @if (instanceList().length > 0) {
      <ul>
        @for (instance of instanceList(); track instance.id) {
          <li>
            <a [routerLink]="'/' + routes.GameInstanceSession.interpolated(instance.id)">
              Instance {{ instance.id }} (GameDef: {{ instance.gameDef.name }}, Master: {{ instance.masterName }})
            </a>
          </li>
        }
      </ul>
    } @else {
      <p>No existing game instances found.</p>
    }
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
  `],
  imports: [
    RouterModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  protected routes = PageMasterRoutes();
  protected gameInstanceService = inject(GameInstanceService);
  protected instanceList = toSignal(this.gameInstanceService.getAllGameInstances(), { initialValue: [] });

  constructor() {
    inject(MainTitleService).setTitle('');
  }
}