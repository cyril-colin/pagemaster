import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CurrentSessionState } from './core/current-session.state';
import { EventsCenterComponent } from './core/events-center/events-center.component';
import { PageMasterRoutes } from './core/pagemaster.router';







@Component({
  selector: 'app-root',
  template: `
    <app-events-center />
    <h2>PageMaster</h2>
    <h3><a [routerLink]="'/'+routes.Home.path">Home</a></h3>

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

    <router-outlet></router-outlet>
  `,
  styles: [],
  imports: [
    RouterOutlet,
    RouterModule,
    EventsCenterComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  protected title = 'pagemaster-front';
  protected currentSession = inject(CurrentSessionState);
  protected routes = PageMasterRoutes();

  protected logout() {
    this.currentSession.logout();
  }
}
