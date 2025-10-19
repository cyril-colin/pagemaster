import { ChangeDetectionStrategy, Component, computed, effect, inject, input, linkedSignal, output, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Attributes } from '@pagemaster/common/attributes.types';
import { StrengthListViewComponent } from './strength-list-view.component';

export type Strength = {
  def: Attributes['strength']['definition'],
  instance: Attributes['strength']['instance'],
  selected: boolean,
};

type StrengthForm = FormGroup<{
  id: FormControl<string>,
  selected: FormControl<boolean>,
}>;

@Component({
  selector: 'app-strengths-control',
  template: `
    @if (mode() === 'view') {
      <div (click)="setMode('edit')" class="strength-views">
        @let selection = selectedStrengths();
        @if (selection.length === 0) {
          <span>No strengths selected. Click to edit.</span>
        } @else {
          <app-strength-list-view [strengths]="selection"></app-strength-list-view>
        }
      </div>
    } @else {
      @for(strength of strengths(); track strength.instance.id; let i = $index) {
        <div>
          <input type="checkbox" [formControl]="form.controls.strengthForms.controls[i].controls.selected" />
          <label>{{ strength.def.name }}</label>
        </div>
      }
      <button (click)="submit()">Save</button>
    }
  `,
  styles: [`
    .strength-views {
      display: flex;
      flex-direction: column;
      gap: var(--gap-medium);
      cursor: pointer;
      align-items: center;
    }
  `],
  imports: [
    ReactiveFormsModule,
    StrengthListViewComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StrengthsControlComponent {
  public strengths = input.required<Strength[]>();
  protected strengthsState = linkedSignal(this.strengths);
  protected selectedStrengths = computed(() => this.strengthsState().filter(strength => strength.selected));
  public newStrengths = output<Strength[]>();

  protected fb = inject(FormBuilder);
  protected form = this.fb.group<{strengthForms: FormArray<StrengthForm>}>({
    strengthForms: this.fb.array<StrengthForm>([]),
  });

  protected mode = signal<'view' | 'edit'>('view');
  
  constructor() {
    effect(() => {
      this.form.controls.strengthForms.clear();
      this.strengths().forEach((strength) => {
        const formGroup = this.fb.group({
          id: this.fb.control(strength.instance.id, {nonNullable: true}),
          selected: this.fb.control(strength.selected, {nonNullable: true}),
        });
        this.form.controls.strengthForms.push(formGroup);
      });
    });
  }

  protected setMode(newMode: 'view' | 'edit'): void {
    this.mode.set(newMode);
  }

  protected matchingStrength(id: string): Strength | null {
    return this.strengths().find(s => s.instance.id === id) || null;
  }

  protected submit(): void {
    this.setMode('view');
    const data = this.form.getRawValue().strengthForms;
    const result = data.reduce<Strength[]>((acc, strengthForm) => {
      const matching = this.matchingStrength(strengthForm.id);
      if (matching) {
        acc.push({
          def: matching.def,
          instance: {
            id: strengthForm.id,
          },
          selected: strengthForm.selected,
        });
      }
      return acc;
    }, []);
    this.strengthsState.set(result);
    this.newStrengths.emit(result);
  }
}
