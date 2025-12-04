import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Player } from '@pagemaster/common/pagemaster.types';
import { AvatarViewComponent } from './avatar/avatar-view.component';
import { NameViewComponent } from './names/name-view.component';

@Component({
  selector: 'app-player-button',
  template: `
    @let p = player();
    
    <div class="player-button" (click)="clicked.emit()">
      <app-avatar-view [player]="p" [permissions]="{ edit: false }"/>
      <app-name-view [name]="p.name" />
    </div>
  `,
  styles: [`
    .player-button {
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

    .player-button:hover {
      background-color: var(--hover-bg);
      border-color: var(--color-primary);
    }


  `],
  imports: [
    AvatarViewComponent,
    NameViewComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerButtonComponent {
  public player = input.required<Player>();
  public clicked = output<void>();
}
