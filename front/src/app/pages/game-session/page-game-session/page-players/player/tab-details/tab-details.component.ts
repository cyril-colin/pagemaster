import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-tab-player-details',
  template: `
    <p>tab-details works!</p>
  `,
  styles: [
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabDetailsComponent {

}