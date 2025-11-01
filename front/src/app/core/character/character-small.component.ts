import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { Character, GameDef } from '@pagemaster/common/pagemaster.types';
import { AvatarViewComponent } from './avatar/avatar-view.component';
import { CharacterAttributesService } from './character-attributes.service';
import { NameViewComponent } from './names/name-view.component';

@Component({
  selector: 'app-character-small',
  template: `
    @let char = character();
    
    <div class="character-small" (click)="clicked.emit()">
      <app-avatar-view [source]="char.picture" [permissions]="{edit: false}" />
      <div class="info">
        <app-name-view [name]="char.name" />
        @for(bar of playerBars(); track bar.instance.id) {
          <div>{{ bar.def.name }}: {{ bar.instance.current }} / {{ bar.def.max }}</div>
        }
      </div>
    </div>
  `,
  styles: [`
    .character-small {
      display: flex;
      flex-direction: row;
      gap: var(--gap-medium);
      align-items: center;
      cursor: pointer;
      padding: var(--padding-medium);
      border-radius: var(--view-border-radius);
      background-color: var(--color-background-tertiary);
      border: 1px solid var(--color-border-heavy);
    }

    .character-small:hover {
      background-color: var(--hover-bg);
      border-color: var(--color-border);
    }

    app-avatar-view {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      overflow: hidden;
      flex-shrink: 0;
      border: 2px solid var(--color-border);
    }

    .info {
      display: flex;
      flex-direction: column;
      gap: var(--gap-small);
      flex: 1;
      min-width: 0;
      color: var(--text-secondary);
      font-size: var(--text-size-small);
    }
  `],
  imports: [
    AvatarViewComponent,
    NameViewComponent,
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
    ).filter(bar => bar.selected);
  });
}
