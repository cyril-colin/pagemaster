import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-game-instance-join',
  template: `
    <div>
      <h1>Join Game Instance</h1>
      <!-- Add your join game logic here -->
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameInstanceJoinComponent {
}