import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SkillViewComponent } from './skill-view.component';
import { Skill } from './skills-control.component';

@Component({
  selector: 'app-skill-list-view',
  template: `
    @for(skill of skills(); track skill.instance.id) {
      <app-skill-view [skill]="skill"></app-skill-view>
    }
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--gap-medium);
      width: 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SkillViewComponent],
})
export class SkillListViewComponent {
  public skills = input.required<Skill[]>();
}
