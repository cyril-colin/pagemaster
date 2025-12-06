import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ICON_STORE, IconName } from './icon.store';

export type { IconName };
export type ImageSize = 'xs' | 's' | 'm' | 'l';

@Component({
  selector: 'ds-image',
  template: `
    @if (icon()) {
      <div 
        [class]="'ds-icon size-' + size()"
        [class.clickable]="clickable()"
        [innerHTML]="iconSvg()"
      ></div>
    } @else {
      <img 
        [src]="src()" 
        [alt]="alt()"
        [class]="'ds-image size-' + size()"
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
      border-radius: var(--item-component-border-radius, 8px);
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
    .size-xs {
      width: var(--ds-image-component-size-xs);
      height: var(--ds-image-component-size-xs);
    }

    .size-s {
      width: var(--ds-image-component-size-s);
      height: var(--ds-image-component-size-s);
    }

    .size-m {
      width: var(--ds-image-component-size-m);
      height: var(--ds-image-component-size-m);
    }

    .size-l {
      width: var(--ds-image-component-size-l);
      height: var(--ds-image-component-size-l);
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
  public size = input<ImageSize>('m');
  public clickable = input<boolean>(false);
  public objectFit = input<'cover' | 'contain'>('contain');

  protected iconSvg = computed<SafeHtml>(() => {
    const iconName = this.icon();
    if (!iconName) return '';
    const svgString = ICON_STORE[iconName];
    return this.sanitizer.bypassSecurityTrustHtml(svgString);
  });
}
