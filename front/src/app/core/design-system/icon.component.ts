import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ICON_STORE, IconName } from './icon.store';

@Component({
  selector: 'ds-icon',
  standalone: true,
  template: `
    <span class="icon" [innerHTML]="iconSvg()"></span>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    .icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    }

    .icon :deep(svg) {
      width: 100%;
      height: 100%;
      display: block;
      stroke: currentColor;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  private sanitizer = inject(DomSanitizer);
  public name = input.required<IconName>();

  protected iconSvg = computed((): SafeHtml => {
    const svg = ICON_STORE[this.name()];
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  });
}
