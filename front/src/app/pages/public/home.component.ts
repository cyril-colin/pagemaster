import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { MainTitleService } from 'src/app/core/main-bar/main-title.service';
import { PageMasterRoutes } from '../../core/pagemaster.router';
import { GameInstanceRepository } from '../../core/repositories/game-instance.repository';

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
      padding: var(--padding-large);
      width: 100%;
      max-width: var(--content-max-width);
      margin: 0 auto;
    }

    h1 {
      color: var(--color-primary);
      margin-bottom: var(--gap-large);
      font-size: 32px;
    }

    h2 {
      color: var(--text-primary);
      margin-top: var(--gap-large);
      margin-bottom: var(--gap-medium);
    }

    ul {
      list-style: none;
      width: 100%;
      max-width: 600px;
      display: flex;
      flex-direction: column;
      gap: var(--gap-medium);
    }

    li {
      background-color: var(--color-background-secondary);
      border: var(--view-border);
      border-radius: var(--view-border-radius);
    }

    a {
      display: flex;
      padding: var(--padding-medium);
      color: var(--text-primary);
      font-weight: var(--text-weight-medium);
    }

    li:hover {
      background-color: var(--hover-bg);
      border-color: var(--color-primary);
    }

    p {
      color: var(--text-secondary);
      font-style: italic;
    }
  `],
  imports: [
    RouterModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  protected routes = PageMasterRoutes();
  protected gameInstanceService = inject(GameInstanceRepository);
  protected instanceList = toSignal(this.gameInstanceService.getAllGameInstances(), { initialValue: [] });

  constructor() {
    inject(MainTitleService).setTitle('');
  }
}