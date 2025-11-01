import { ChangeDetectionStrategy, Component, computed, effect, inject, input, linkedSignal, output, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Attributes } from '@pagemaster/common/attributes.types';
import { WeaknessListViewComponent } from './weakness-list-view.component';

export type Weakness = {
  def: Attributes['weakness']['definition'],
  instance: Attributes['weakness']['instance'],
  selected: boolean,
};

export type WeaknessesPermissions = {
  edit: boolean,
};

type WeaknessForm = FormGroup<{
  id: FormControl<string>,
  selected: FormControl<boolean>,
}>;

@Component({
  selector: 'app-weaknesses-control',
  template: `
    @if (mode() === 'view') {
      <div (click)="setMode('edit')" [class.weakness-views]="permissions().edit" [class.weakness-readonly]="!permissions().edit">
        @let selection = selectedWeaknesses();
        @if (selection.length === 0) {
          <span>No weaknesses selected. Click to edit.</span>
        } @else {
          <app-weakness-list-view [weaknesses]="selection"></app-weakness-list-view>
        }
      </div>
    } @else {
      @for(weakness of weaknesses(); track weakness.instance.id; let i = $index) {
        <div>
          <input type="checkbox" [formControl]="form.controls.weaknessForms.controls[i].controls.selected" />
          <label>{{ weakness.def.name }}</label>
        </div>
      }
      <button (click)="$event.preventDefault(); submit()">Save</button>
    }
  `,
  styles: [`
    .weakness-views {
      display: flex;
      flex-direction: column;
      gap: var(--gap-medium);
      cursor: pointer;
      align-items: center;
    }

    .weakness-readonly {
      display: flex;
      flex-direction: column;
      gap: var(--gap-medium);
      align-items: center;
    }
  `],
  imports: [
    ReactiveFormsModule,
    WeaknessListViewComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeaknessesControlComponent {
  public weaknesses = input.required<Weakness[]>();
  public permissions = input.required<WeaknessesPermissions>();
  protected weaknessesState = linkedSignal(this.weaknesses);
  protected selectedWeaknesses = computed(() => this.weaknessesState().filter(weakness => weakness.selected));
  public newWeaknesses = output<Weakness[]>();

  protected fb = inject(FormBuilder);
  protected form = this.fb.group<{weaknessForms: FormArray<WeaknessForm>}>({
    weaknessForms: this.fb.array<WeaknessForm>([]),
  });

  protected mode = signal<'view' | 'edit'>('view');
  
  constructor() {
    effect(() => {
      this.form.controls.weaknessForms.clear();
      this.weaknesses().forEach((weakness) => {
        const formGroup = this.fb.group({
          id: this.fb.control(weakness.instance.id, {nonNullable: true}),
          selected: this.fb.control(weakness.selected, {nonNullable: true}),
        });
        this.form.controls.weaknessForms.push(formGroup);
      });
    });
  }

  protected setMode(newMode: 'view' | 'edit'): void {
    if (!this.permissions().edit && newMode === 'edit') {
      return;
    }
    this.mode.set(newMode);
  }

  protected matchingWeakness(id: string): Weakness | null {
    return this.weaknesses().find(w => w.instance.id === id) || null;
  }

  protected submit(): void {
    this.setMode('view');
    const data = this.form.getRawValue().weaknessForms;
    const result = data.reduce<Weakness[]>((acc, weaknessForm) => {
      const matching = this.matchingWeakness(weaknessForm.id);
      if (matching) {
        acc.push({
          def: matching.def,
          instance: {
            id: weaknessForm.id,
          },
          selected: weaknessForm.selected,
        });
      }
      return acc;
    }, []);
    this.weaknessesState.set(result);
    this.newWeaknesses.emit(result);
  }
}
