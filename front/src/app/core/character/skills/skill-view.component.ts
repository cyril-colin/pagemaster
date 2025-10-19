import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Skill } from './skills-control.component';

@Component({
  selector: 'app-skill-view',
  template: `
    @let s = skill();
    <div class="skill-container">
      <span class="skill-name">{{s.def.name}}</span>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      min-width: 100px;
      width: fit-content;
    }
    
    .skill-container {
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
    
    .skill-name {
      font-size: 12px;
      color: var(--text-primary);
      font-weight: 500;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillViewComponent {
  public skill = input.required<Skill>();
}
