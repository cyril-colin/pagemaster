import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Weakness } from './weaknesses-control.component';

@Component({
  selector: 'app-weakness-view',
  template: `
    @let w = weakness();
    <div class="weakness-container">
      <span class="weakness-name">{{w.def.name}}</span>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      min-width: 100px;
      width: fit-content;
    }
    
    .weakness-container {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: var(--view-height-medium);
      border: var(--view-border);
      border-radius: var(--view-border-radius);
      padding: 0 var(--gap-small);
      background: transparent;
    }
    
    .weakness-name {
      font-size: 12px;
      color: var(--text-primary);
      font-weight: 500;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeaknessViewComponent {
  public weakness = input.required<Weakness>();
}
