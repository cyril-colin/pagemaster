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
      flex-direction: row;
      align-items: center;
      gap: var(--gap-medium);
      cursor: pointer;
      padding: var(--padding-medium);
      border-radius: var(--view-border-radius);
      background-color: var(--color-background-tertiary);
      border: var(--view-border);
      width: 100%;
    }

    .character-button:hover {
      background-color: var(--hover-bg);
      border-color: var(--color-primary);
    }

    app-avatar-view {
      width: 56px;
      height: 56px;
      min-width: 56px;
      border-radius: 50%;
      overflow: hidden;
      border: 2px solid var(--color-border);
      flex-shrink: 0;
    }

    app-name-view {
      font-size: var(--text-size-medium);
      text-align: left;
      color: var(--text-primary);
      flex: 1;
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
