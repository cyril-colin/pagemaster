import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AttributeBar, Attributes } from '@pagemaster/common/attributes.types';
import { BarComponent } from '../../design-system/bar.component';


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
    @for(bar of selectedBars(); track bar.instance.id) {
        <ds-bar 
          [value]="bar.instance.current" 
          [color]="bar.def.color" 
          [editable]="permissions().edit"
          [min]="bar.def.min"
          [max]="bar.def.max"
          (newValue)="updateBarValue(bar, $event)"
        />
    }
  `,
  styles: [
    `
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--gap-medium);
    }

    .bars-view {
      cursor: pointer;
      padding: var(--card-padding);
      background-color: var(--color-background-secondary);
      border: var(--view-border);
      border-radius: var(--view-border-radius);
    }

    .bars-view:hover {
      background-color: var(--hover-bg);
      border-color: var(--color-border-light);
    }

    .bars-readonly {
      padding: var(--card-padding);
      background-color: var(--color-background-secondary);
      border: var(--view-border);
      border-radius: var(--view-border-radius);
    }

    .bar-edit-item {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: var(--gap-medium);
      padding: var(--gap-small);
      background-color: var(--color-background-tertiary);
      border: var(--view-border);
      border-radius: var(--view-border-radius);
      margin-bottom: var(--gap-small);
    }

    .bar-edit-item label {
      flex: 1;
      color: var(--text-primary);
      font-weight: var(--text-weight-medium);
    }

    .bar-edit-item input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }

    .bar-edit-item input[type="number"] {
      width: 80px;
      padding: var(--gap-small);
      background-color: var(--color-background-main);
      border: var(--view-border);
      border-radius: var(--view-border-radius);
      color: var(--text-primary);
      text-align: center;
    }

    button {
      padding: var(--gap-small) var(--padding-medium);
      background-color: var(--color-primary);
      color: var(--text-on-primary);
      border: none;
      border-radius: var(--view-border-radius);
      cursor: pointer;
      font-weight: var(--text-weight-medium);
    }

    button:hover {
      background-color: var(--color-primary-hover);
    }
    `,
  ],
  imports: [
    ReactiveFormsModule,
    BarComponent,
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

  protected matchingBar(id: string, bars: Bar[]): Bar |null {
    return bars.find(b => b.instance.id === id) || null;
  }

  protected updateBarValue(bar: Bar, newValue: number): void {
    const bars = this.bars();
    const matching = this.matchingBar(bar.instance.id, bars);

    if (matching) {
      matching.instance.current = newValue;
      this.newBars.emit(bars);
    }
  }
  
}