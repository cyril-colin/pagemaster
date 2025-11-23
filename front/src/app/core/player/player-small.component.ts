import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Player } from '@pagemaster/common/pagemaster.types';
import { AvatarViewComponent } from './avatar/avatar-view.component';
import { NameViewComponent } from './names/name-view.component';

@Component({
  selector: 'app-player-small',
  template: `
    @let p = player();
    
    <div class="player-small" (click)="clicked.emit()">
      <app-avatar-view [source]="p.avatar" [permissions]="{edit: false}" />
      <div class="info">
        <app-name-view [name]="p.name" />
        @for(bar of p.attributes.bar; track bar.id) {
          <div>{{ bar.name }}: {{ bar.current }} / {{ bar.max }}</div>
        }
      </div>
    </div>
  `,
  styles: [`
    .player-small {
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

    .player-small:hover {
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
export class PlayerSmallComponent {
  public player = input.required<Player>();
  public clicked = output<void>();
}
