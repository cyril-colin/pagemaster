import { ChangeDetectionStrategy, Component, computed, effect, inject, input, linkedSignal, output, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Skill as SkillDef, SkillInstance } from '@pagemaster/common/skills.types';
import { SkillListViewComponent } from './skill-list-view.component';

type SkillForm = FormGroup<{
  id: FormControl<string>,
  selected: FormControl<boolean>,
}>;

export type Skill = { def: SkillDef, instance: SkillInstance, selected: boolean };

@Component({
  selector: 'app-skills-control',
  template: `
    @if (mode() === 'view') {
      <div (click)="setMode('edit')" class="skill-views">
        @let selection = selectedSkills();
        @if (selection.length === 0) {
          <span>No skills selected. Click to edit.</span>
        } @else {
          <app-skill-list-view [skills]="selection"></app-skill-list-view>
        }
      </div>
    } @else {
      @for(skill of skills(); track skill.instance.id; let i = $index) {
        <div>
          <input type="checkbox" [formControl]="form.controls.skillForms.controls[i].controls.selected" />
          <label>{{ skill.def.name }}</label>
          <input
            type="text"
            [formControl]="form.controls.skillForms.controls[i].controls.id" />
        </div>
      }
      <button (click)="submit()">Save</button>
    }
  `,
  styles: [`
    .skill-views {
      display: flex;
      flex-direction: column;
      gap: var(--gap-medium);
      cursor: pointer;
      align-items: center;
    }
  `],
  imports: [
    ReactiveFormsModule,
    SkillListViewComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillsControlComponent {
  public skills = input.required<Skill[]>();
  protected skillsState = linkedSignal(this.skills);
  protected selectedSkills = computed(() => this.skillsState().filter(skill => skill.selected));
  public newSkills = output<Skill[]>();

  protected fb = inject(FormBuilder);
  protected form = this.fb.group<{skillForms: FormArray<SkillForm>}>({
    skillForms: this.fb.array<SkillForm>([]),
  });

  protected mode = signal<'view' | 'edit'>('view');
  
  constructor() {
    effect(() => {
      this.form.controls.skillForms.clear();
      this.skills().forEach((skill) => {
        const formGroup = this.fb.group({
          id: this.fb.control(skill.instance.id, {nonNullable: true}),
          selected: this.fb.control(skill.selected, {nonNullable: true}),
        });
        this.form.controls.skillForms.push(formGroup);
      });
    });
  }

  protected setMode(newMode: 'view' | 'edit'): void {
    this.mode.set(newMode);
  }

  protected matchingSkill(id: string): Skill | null {
    return this.skills().find(s => s.instance.id === id) || null;
  }

  protected submit(): void {
    this.setMode('view');
    const data = this.form.getRawValue().skillForms;
    const result = data.reduce<Skill[]>((acc, skillForm) => {
      const matching = this.matchingSkill(skillForm.id);
      if (matching) {
        acc.push({
          def: matching.def,
          instance: {
            id: skillForm.id,
          },
          selected: skillForm.selected,
        });
      }
      return acc;
    }, []);
    this.skillsState.set(result);
    this.newSkills.emit(result);
  }
}
