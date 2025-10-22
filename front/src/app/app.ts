import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-root',
  template: `
    <router-outlet></router-outlet>
  `,
  styles: [],
  imports: [
    RouterOutlet,
    RouterModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
}
