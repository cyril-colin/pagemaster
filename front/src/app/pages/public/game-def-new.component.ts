import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-game-def-new',
  template: `
    <div>
      <h1>Create New Game Definition</h1>
      <!-- Add your game definition creation logic here -->
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameDefNewComponent {
}