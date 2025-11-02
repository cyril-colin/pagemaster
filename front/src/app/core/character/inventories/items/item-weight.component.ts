import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-item-weight',
  template: `
    <div class="weight-badge">
      {{ weight() }}
    </div>
  `,
  styles: [`
    .weight-badge {
      position: absolute;
      bottom: 4px;
      right: 4px;
      background: var(--color-background-tertiary);
      color: var(--text-primary);
      font-size: var(--text-size-small);
      font-weight: var(--text-weight-medium);
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid var(--color-border);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      z-index: 1;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ItemWeightComponent {
  public weight = input.required<number>();
}
