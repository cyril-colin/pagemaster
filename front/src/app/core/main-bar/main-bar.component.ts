import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { RouterModule } from '@angular/router';
import { CurrentSessionState } from '../current-session.state';
import { PageMasterRoutes } from '../pagemaster.router';
import { MainTitleService } from './main-title.service';

@Component({
  selector: 'app-main-bar',
  template: `
    <a [routerLink]="'/'+ routes.Home.path">PageMaster</a>
    <h2>{{ titleService.title() }}</h2>
    @let participant = currentSession.currentSessionNullable()?.participant;
    @let currentGame = currentSession.currentSessionNullable()?.gameInstance;
    @if (participant && currentGame && currentGame.id) {
      <h3>
        <a [routerLink]="'/'+routes.GameInstanceSession.interpolated(currentGame.id)">
          {{ participant.name || 'Guest' }}
        </a>
        <button (click)="logout()">Logout</button>
      </h3>
    }

  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: row;
      gap: 1rem;
      width: 100%;
      align-items: center;
      justify-content: space-between;
    } 
  `],
  imports: [
    RouterModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainBarComponent {
  protected currentSession = inject(CurrentSessionState);
  protected routes = PageMasterRoutes();
  protected titleService = inject(MainTitleService);
  
  protected logout() {
    this.currentSession.logout();
  }
}