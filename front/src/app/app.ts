import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MainBarComponent } from './core/main-bar/main-bar.component';


@Component({
  selector: 'app-root',
  template: `
    <app-main-bar />
    <router-outlet></router-outlet>
  `,
  styles: [],
  imports: [
    RouterOutlet,
    RouterModule,
    MainBarComponent,
    MainBarComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
}
