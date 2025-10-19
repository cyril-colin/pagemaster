import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-description-view',
  template: `
    <p class="description">{{description()}}</p>
  `,
  styles: [`
    :host {
      display: flex;
      width: 100%;
    }
    
    .description {
      font-size: var(--text-size-medium);
      color: var(--text-primary);
      font-weight: var(--text-weight-normal);
      margin: 0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DescriptionViewComponent {
  public description = input.required<string>();
}
