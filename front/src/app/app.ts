import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { EventsCenterComponent } from './core/events-center/events-center.component';
import { MainBarComponent } from './core/main-bar/main-bar.component';


@Component({
  selector: 'app-root',
  template: `
    <app-events-center />
    <app-main-bar />
    <router-outlet></router-outlet>
  `,
  styles: [],
  imports: [
    RouterOutlet,
    RouterModule,
    EventsCenterComponent,
    MainBarComponent,
    MainBarComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
}
