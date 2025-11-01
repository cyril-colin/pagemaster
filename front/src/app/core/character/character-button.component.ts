import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Character } from '@pagemaster/common/pagemaster.types';
import { AvatarViewComponent } from './avatar/avatar-view.component';
import { NameViewComponent } from './names/name-view.component';

@Component({
  selector: 'app-character-button',
  template: `
    @let char = character();
    
    <div class="character-button" (click)="clicked.emit()">
      <app-avatar-view [source]="char.picture" [permissions]="{ edit: false }"/>
      <app-name-view [name]="char.name" />
    </div>
  `,
  styles: [`
    .character-button {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--gap-small);
      cursor: pointer;
      padding: var(--gap-medium);
      border-radius: var(--view-border-radius);
      background-color: var(--color-background-tertiary);
      border: 1px solid var(--color-border-heavy);
      min-width: 80px;
    }

    .character-button:hover {
      background-color: var(--hover-bg);
      border-color: var(--color-primary);
    }

    app-avatar-view {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      overflow: hidden;
      border: 2px solid var(--color-border);
    }

    app-name-view {
      font-size: var(--text-size-small);
      text-align: center;
      color: var(--text-secondary);
    }
  `],
  imports: [
    AvatarViewComponent,
    NameViewComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharacterButtonComponent {
  public character = input.required<Character>();
  public clicked = output<void>();
}
