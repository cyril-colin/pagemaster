import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Player } from '@pagemaster/common/pagemaster.types';
import { GameSessionPermissions } from '@pagemaster/common/permissions.types';
import { ButtonComponent } from '../../design-system/button.component';
import { ImageComponent } from '../../design-system/image.component';

@Component({
  selector: 'app-avatar-view',
  template: `
    <ds-image
      [src]="src()" 
      [alt]="'Player Picture'"
      [size]="'l'"
      [clickable]="permissions().edit"
      (click)="permissions().edit && needSrc.emit()" 
    />

    @if (permissions().edit) {
      <ds-button [mode]="'mini'" (click)="needSrc.emit()" [icon]="'edit'" />
    }
  `,
  styles: `
    :host {
      display: flex;
      align-items: flex-start;
      justify-content: center;
      max-width: 100%;
      max-height: 100%;

    }

    
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ImageComponent, ButtonComponent],
})
export class AvatarViewComponent {
  public player = input.required<Player>();
  public permissions = input.required<GameSessionPermissions['avatar']>();
  public needSrc = output<void>();

  protected src = computed(() => {
    const ifMissing = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(this.player().name)}`;
    return this.player().avatar || ifMissing;
  });
}
