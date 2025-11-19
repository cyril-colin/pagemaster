import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-name-view',
  template: `
    <span class="name">{{name()}}</span>
  `,
  styles: [`
    :host {
      display: flex;
      width: 100%;
    }
    
    .name {
      font-size: var(--text-size-large);
      color: var(--text-primary);
      font-weight: var(--text-weight-bold);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NameViewComponent {
  public name = input.required<string>();
}
