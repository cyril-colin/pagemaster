import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AvatarPermissions } from './picture-control.component';

@Component({
  selector: 'app-avatar-view',
  template: `
    @let src = source();
    @if (src) {
      <img 
        [src]="src" 
        alt="Character Picture" 
        [height]="100" 
        [width]="100" 
        [class.clickable]="permissions().edit"
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
      display: block;
    }

    img {
      max-width: 100%;
      height: auto;
    }

    img.clickable {
      cursor: pointer;
    }

    span {
      cursor: pointer;
      color: var(--primary-color, #007bff);
      text-decoration: underline;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarViewComponent {
  public source = input<string>();
  public permissions = input.required<AvatarPermissions>();
  public needSrc = output<void>();
}
