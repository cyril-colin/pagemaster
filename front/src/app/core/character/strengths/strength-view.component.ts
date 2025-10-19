import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Strength } from './strengths-control.component';

@Component({
  selector: 'app-strength-view',
  template: `
    @let s = strength();
    <div class="strength-container">
      <span class="strength-name">{{s.def.name}}</span>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      min-width: 100px;
      width: fit-content;
    }
    
    .strength-container {
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
    
    .strength-name {
      font-size: 12px;
      color: var(--text-primary);
      font-weight: 500;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StrengthViewComponent {
  public strength = input.required<Strength>();
}
