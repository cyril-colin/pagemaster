import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ImageComponent, ImageShape } from '../../design-system/image.component';
import { AvatarPermissions } from './picture-control.component';

@Component({
  selector: 'app-avatar-view',
  template: `
    @let src = source();
    @if (src) {
      <ds-image
        [src]="src" 
        [alt]="'Player Picture'"
        size="large"
        [shape]="shape()"
        [clickable]="permissions().edit"
        (click)="permissions().edit && needSrc.emit()" 
      />
    } @else {
      @if (permissions().edit) {
        <span (click)="needSrc.emit()">Set Picture URL</span>
      }
    }
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      max-width: 100%;
      max-height: 100%;
    }

    span {
      cursor: pointer;
      color: var(--primary-color, #007bff);
      text-decoration: underline;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ImageComponent],
})
export class AvatarViewComponent {
  public source = input<string>();
  public shape = input<ImageShape>('circle');
  public permissions = input.required<AvatarPermissions>();
  public needSrc = output<void>();
}
