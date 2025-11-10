import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ICON_STORE, IconName } from './icon.store';

export type { IconName };
export type ImageSize = 'icon' | 'small' | 'medium' | 'large';
export type ImageShape = 'circle' | 'rectangle';

@Component({
  selector: 'ds-image',
  template: `
    @if (icon()) {
      <div 
        [class]="'ds-icon size-' + size() + ' shape-' + shape()"
        [class.clickable]="clickable()"
        [innerHTML]="iconSvg()"
      ></div>
    } @else {
      <img 
        [src]="src()" 
        [alt]="alt()"
        [class]="'ds-image size-' + size() + ' shape-' + shape()"
        [class.clickable]="clickable()"
        [class.cover]="objectFit() === 'cover'"
        [class.contain]="objectFit() === 'contain'"
      />
    }
  `,
  styles: [`
    .ds-image, .ds-icon {
      display: block;
      object-fit: contain;
      max-width: 100%;
      max-height: 100%;
    }

    .ds-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      color: currentColor;
    }

    .ds-icon :deep(svg) {
      width: 100%;
      height: 100%;
      stroke: currentColor;
    }

    .ds-image.cover {
      object-fit: cover;
    }

    .ds-image.contain {
      object-fit: contain;
    }

    /* Sizes */
    .size-icon {
      width: 32px;
      height: 32px;
    }

    .size-small {
      width: 50px;
      height: 50px;
    }

    .size-medium {
      width: var(--item-img-size, 64px);
      height: var(--item-img-size, 64px);
    }

    .size-large {
      width: 100px;
      height: 100px;
    }

    /* Shapes */
    .shape-circle {
      border-radius: 50%;
    }

    .shape-rectangle {
      border-radius: var(--item-border-radius, 8px);
    }

    /* States */
    .clickable {
      cursor: pointer;
    }

    .clickable:hover {
      opacity: 0.8;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ImageComponent {
  private sanitizer = inject(DomSanitizer);

  public src = input<string>('');
  public icon = input<IconName | null>(null);
  public alt = input<string>('');
  public size = input<ImageSize>('medium');
  public shape = input<ImageShape>('rectangle');
  public clickable = input<boolean>(false);
  public objectFit = input<'cover' | 'contain'>('contain');

  protected iconSvg = computed<SafeHtml>(() => {
    const iconName = this.icon();
    if (!iconName) return '';
    const svgString = ICON_STORE[iconName];
    return this.sanitizer.bypassSecurityTrustHtml(svgString);
  });
}
