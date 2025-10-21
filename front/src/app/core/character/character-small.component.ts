import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { Character, GameDef } from '@pagemaster/common/pagemaster.types';
import { AvatarViewComponent } from './avatar/avatar-view.component';
import { BarListViewComponent } from './bars/bar-list-view.component';
import { CharacterAttributesService } from './character-attributes.service';
import { NameViewComponent } from './names/name-view.component';

@Component({
  selector: 'app-character-small',
  template: `
    @let char = character();
    
    <div class="character-small" (click)="clicked.emit()">
      <app-avatar-view [source]="char.picture"/>
      <div class="info">
        <app-name-view [name]="char.name" />
        <app-bar-list-view [bars]="playerBars()" />
      </div>
    </div>
  `,
  styles: [`
    .character-small {
      display: flex;
      flex-direction: row;
      gap: var(--gap-small);
      align-items: center;
      cursor: pointer;
      padding: var(--gap-small);
      border-radius: var(--border-radius);
      transition: background-color 0.2s ease;
    }

    .character-small:hover {
      background-color: var(--hover-bg, rgba(0, 0, 0, 0.05));
    }

    app-avatar-view {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      overflow: hidden;
      flex-shrink: 0;
    }

    .info {
      display: flex;
      flex-direction: column;
      gap: var(--gap-tiny, 4px);
      flex: 1;
      min-width: 0;
    }
  `],
  imports: [
    AvatarViewComponent,
    NameViewComponent,
    BarListViewComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharacterSmallComponent {
  private characterAttributesService = inject(CharacterAttributesService);
  public character = input.required<Character>();
  public gameDef = input.required<GameDef>();
  public clicked = output<void>();
  
  protected playerBars = computed(() => {
    return this.characterAttributesService.mapPlayerBars(
      this.character(),
      this.gameDef(),
    );
  });
}
