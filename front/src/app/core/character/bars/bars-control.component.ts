import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AttributeBar, Attributes } from '@pagemaster/common/attributes.types';
import { BarListViewComponent } from './bar-list-view.component';


type BarForm = FormGroup<{
  id: FormControl<string>,
  current: FormControl<number>,
  selected: FormControl<boolean>,
}>;

export type Bar = {def: AttributeBar, instance: Attributes['bar']['instance'], selected: boolean};

export type BarsPermissions = {
  edit: boolean,
};

@Component({
  selector: 'app-bars-control',
  template: `

    @if (mode() === 'view') {
      <div (click)="setMode('edit')" [class.bars-view]="permissions().edit" [class.bars-readonly]="!permissions().edit">
        <app-bar-list-view [bars]="selectedBars()" />
      </div>
    } @else {
      @for(bar of bars(); track bar.instance; let i = $index) {
        <div>
          <input type="checkbox" [formControl]="form.controls.barForms.controls[i].controls.selected" />
          <label>{{ bar.def.name }}</label>
          <input
            type="number"
            [min]="bar.def.min"
            [max]="bar.def.max"
            [formControl]="form.controls.barForms.controls[i].controls.current" />
        </div>
      }
      <button (click)="$event.preventDefault(); submit()">Save</button>
    }
    
  `,
  styles: [
    `
    .bars-view {
      cursor: pointer;
    }

    .bars-readonly {
    }
    `,
  ],
  imports: [
    ReactiveFormsModule,
    BarListViewComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarsControlComponent {
  public bars = input.required<Bar[]>();
  public permissions = input.required<BarsPermissions>();
  protected selectedBars = computed(() => this.bars().filter(bar => bar.selected));
  public newBars = output<Bar[]>();
  
  protected fb = inject(FormBuilder);
  protected form = this.fb.group<{barForms: FormArray<BarForm>}>({
    barForms: this.fb.array<BarForm>([]),
  });

  protected mode = signal<'view' | 'edit'>('view');
  constructor() {
    effect(() => {
      this.mode.set('view');
      this.form.controls.barForms.clear();
      this.bars().forEach((bar) => {
        const formGroup = this.fb.group({
          id: this.fb.control(bar.instance.id, {nonNullable: true}),
          current: this.fb.control(bar.instance.current, {nonNullable: true, validators: [
            Validators.min(bar.def.min),
            Validators.max(bar.def.max),
          ]}),
          selected: this.fb.control(bar.selected, {nonNullable: true}),
        });
        this.form.controls.barForms.push(formGroup);
      });
    });
  }


  protected setMode(newMode: 'view' | 'edit'): void {
    if (!this.permissions().edit && newMode === 'edit') {
      return;
    }
    this.mode.set(newMode);
  }

  protected matchingBar(id: string): {def: AttributeBar, instance: Attributes['bar']['instance'], selected: boolean} |null {
    return this.bars().find(b => b.instance.id === id) || null;
  }

  protected submit(): void {
    this.setMode('view');

    const data = this.form.getRawValue().barForms;
    const result = data.reduce<Bar[]>((acc, barForm) => {
      const matching = this.matchingBar(barForm.id);
      if (matching) {
        acc.push({
          def: matching.def,
          instance: {
            id: barForm.id,
            current: barForm.current,
          },
          selected: barForm.selected,
        });
      }
      return acc;
    }, []);

    this.newBars.emit(result);
  }
  
}