import { ChangeDetectionStrategy, Component, computed, effect, inject, input, linkedSignal, output, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Attributes } from '@pagemaster/common/attributes.types';
import { StatusListViewComponent } from './status-list-view.component';

export type Status = {
  definition: Attributes['status']['definition'],
  instance: Attributes['status']['instance'],
  selected: boolean,
};

export type StatusesPermissions = {
  edit: boolean,
};

type StatusForm = FormGroup<{
  id: FormControl<string>,
  current: FormControl<string>,
  selected: FormControl<boolean>,
}>;

@Component({
  selector: 'app-status-control',
  template: `
    @if (mode() === 'view') {
      <div (click)="setMode('edit')" [class.statuses-view]="permissions().edit" [class.statuses-readonly]="!permissions().edit">
        @let selection = selectedStatuses();
        @if (selection.length === 0) {
          <span class="empty-message">No statuses selected. Click to edit.</span>
        } @else {
          <app-status-list-view [statuses]="selection"></app-status-list-view>
        }
      </div>
    } @else {
      @for(status of statuses(); track status.instance; let i = $index) {
        <div class="status-edit-item">
          <input type="checkbox" [formControl]="form.controls.statusForms.controls[i].controls.selected" />
          <label>{{ status.definition.name }}</label>
          <input
            type="text"
            [formControl]="form.controls.statusForms.controls[i].controls.current" />
        </div>
      }
      <button (click)="$event.preventDefault(); submit()">Save</button>
    }
  `,
  styles: [
    `
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--gap-medium);
    }

    .statuses-view {
      cursor: pointer;
      padding: var(--card-padding);
      background-color: var(--color-background-secondary);
      border: var(--view-border);
      border-radius: var(--view-border-radius);
      min-height: 60px;
      display: flex;
      align-items: center;
    }

    .statuses-view:hover {
      background-color: var(--hover-bg);
      border-color: var(--color-border-light);
    }

    .statuses-readonly {
      padding: var(--card-padding);
      background-color: var(--color-background-secondary);
      border: var(--view-border);
      border-radius: var(--view-border-radius);
      min-height: 60px;
      display: flex;
      align-items: center;
    }

    .empty-message {
      color: var(--text-tertiary);
      font-style: italic;
    }

    .status-edit-item {
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

    .status-edit-item label {
      flex: 1;
      color: var(--text-primary);
      font-weight: var(--text-weight-medium);
    }

    .status-edit-item input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }

    .status-edit-item input[type="text"] {
      flex: 1;
      max-width: 200px;
      padding: var(--gap-small);
      background-color: var(--color-background-main);
      border: var(--view-border);
      border-radius: var(--view-border-radius);
      color: var(--text-primary);
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
    StatusListViewComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusControlComponent {
  public statuses = input.required<Status[]>();
  public permissions = input.required<StatusesPermissions>();
  protected statusesState = linkedSignal(this.statuses);
  protected selectedStatuses = computed(() => this.statusesState().filter(status => status.selected));
  public newStatuses = output<Status[]>();

  protected fb = inject(FormBuilder);
  protected form = this.fb.group<{statusForms: FormArray<StatusForm>}>({
    statusForms: this.fb.array<StatusForm>([]),
  });

  protected mode = signal<'view' | 'edit'>('view');
  constructor() {
    effect(() => {
      this.form.controls.statusForms.clear();
      this.statuses().forEach((status) => {
        const formGroup = this.fb.group({
          id: this.fb.control(status.instance.id, {nonNullable: true}),
          current: this.fb.control(status.instance.current, {nonNullable: true}),
          selected: this.fb.control(status.selected, {nonNullable: true}),
        });
        this.form.controls.statusForms.push(formGroup);
      });
    });
  }

  protected setMode(newMode: 'view' | 'edit'): void {
    if (!this.permissions().edit && newMode === 'edit') {
      return;
    }
    this.mode.set(newMode);
  }

  protected matchingStatus(id: string): Status | null {
    return this.statuses().find(s => s.instance.id === id) || null;
  }

  protected submit(): void {
    this.setMode('view');
    const data = this.form.getRawValue().statusForms;
    const result = data.reduce<Status[]>((acc, statusForm) => {
      const matching = this.matchingStatus(statusForm.id);
      if (matching) {
        acc.push({
          definition: matching.definition,
          instance: {
            id: statusForm.id,
            current: statusForm.current,
          },
          selected: statusForm.selected,
        });
      }
      return acc;
    }, []);
    this.statusesState.set(result);
    this.newStatuses.emit(result);
  }
}
