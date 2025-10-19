import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-game-instance-load',
  template: `
    <div>
      <h1>Load Game Instance</h1>
      <!-- Add your load game logic here -->
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameInstanceLoadComponent {
}