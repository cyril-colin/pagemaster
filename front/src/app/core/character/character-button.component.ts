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
      gap: var(--gap-tiny, 4px);
      cursor: pointer;
      padding: var(--gap-small);
      border-radius: var(--border-radius);
      transition: background-color 0.2s ease;
    }

    .character-button:hover {
      background-color: var(--hover-bg, rgba(0, 0, 0, 0.05));
    }

    app-avatar-view {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      overflow: hidden;
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
