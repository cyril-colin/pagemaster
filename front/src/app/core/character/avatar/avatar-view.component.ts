import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-avatar-view',
  template: `
    @let src = source();
    @if (src) {
      <img [src]="src" alt="Character Picture" [height]="100" [width]="100" (click)="needSrc.emit()" />
    } @else {
      <span (click)="needSrc.emit()">Set Picture URL</span>
    }
  `,
  styles: `
    :host {
      display: block;
    }

    img {
      cursor: pointer;
      max-width: 100%;
      height: auto;
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
  public needSrc = output<void>();
}
