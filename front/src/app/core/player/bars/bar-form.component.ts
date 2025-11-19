import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AttributeBar } from '@pagemaster/common/attributes.types';
import { ButtonComponent } from '../../design-system/button.component';

interface BarFormType {
  name: FormControl<string>,
  color: FormControl<string>,
  min: FormControl<number>,
  max: FormControl<number>,
  current: FormControl<number>,
}

@Component({
  selector: 'app-bar-form',
  template: `
    <h2>{{ bar() ? 'Edit' : 'Create a new' }} Bar</h2>
    <form [formGroup]="form" (ngSubmit)="submit()">
      
      <label for="name">Name</label>
      <input id="name" [formControl]="form.controls.name" type="text" />

      <label for="color">Color</label>
      <input id="color" [formControl]="form.controls.color" type="color" />
      
      <label for="min">Minimum Value</label>
      <input id="min" [formControl]="form.controls.min" type="number" />
      
      <label for="max">Maximum Value</label>
      <input id="max" [formControl]="form.controls.max" type="number" />

      <label for="current">Current Value</label>
      <input id="current" [formControl]="form.controls.current" type="number" />
      
      <div class="button-group">
        <ds-button 
          [mode]="'primary'" 
          (click)="submit()" 
          [state]="form.invalid ? {state: 'error', message: 'Form is invalid'} : {state: 'default'}">
          {{ bar() ? 'Update' : 'Create' }} Bar
        </ds-button>
        @if (bar() && permissions().delete) {
          <ds-button [mode]="'primary-danger'" (click)="delete()">Delete</ds-button>
        }
      </div>
    </form>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--gap-medium);
      width: 100%;
    }

    h2 {
      margin: 0 0 var(--gap-medium) 0;
      color: var(--text-primary);
      font-size: var(--text-size-large);
      font-weight: var(--text-weight-bold);
    }

    form {
      display: flex;
      flex-direction: column;
      gap: var(--gap-medium);
    }

    label {
      font-size: var(--text-size-small);
      color: var(--text-secondary);
      font-weight: var(--text-weight-medium);
      margin-bottom: var(--gap-small);
    }

    input[type="text"],
    input[type="number"],
    input[type="color"] {
      width: 100%;
      padding: var(--padding-small);
      background-color: var(--color-background-tertiary);
      border: var(--view-border);
      border-radius: var(--view-border-radius);
      color: var(--text-primary);
      font-size: var(--text-size-medium);
      transition: border-color var(--transition-speed);
    }

    input[type="text"]:focus,
    input[type="number"]:focus,
    input[type="color"]:focus {
      outline: none;
      border-color: var(--color-primary);
    }

    input[type="color"] {
      height: 40px;
      cursor: pointer;
      padding: var(--gap-small);
    }

    .button-group {
      display: flex;
      gap: var(--gap-medium);
    }

    .button-group ds-button {
      flex: 1;
    }
  `],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarFormComponent {
  public bar = input<AttributeBar>();
  public permissions = input<{delete: boolean}>({delete: false});
  public newBar = output<AttributeBar>();
  public deleteBar = output<AttributeBar>();
  private fb = inject(FormBuilder);
  
  protected form = this.fb.group<BarFormType>({
    name: this.fb.control('', { nonNullable: true, validators: [Validators.required]}),
    color: this.fb.control('#000000', { nonNullable: true, validators: [Validators.required]}),
    min: this.fb.control(0, { nonNullable: true, validators: [Validators.required]}),
    max: this.fb.control(100, { nonNullable: true, validators: [Validators.required]}),
    current: this.fb.control(100, { nonNullable: true, validators: [Validators.required]}),
  });

  constructor() {
    effect(() => {
      const existingBar = this.bar();
      if (existingBar) {
        this.form.patchValue({
          name: existingBar.name,
          color: existingBar.color,
          min: existingBar.min,
          max: existingBar.max,
          current: existingBar.current,
        });
      } else {
        // Set random color for new bar
        this.form.controls.color.setValue(this.generateRandomColor());
      }
    });
  }

  private generateRandomColor(): string {
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    return '#' + randomColor.padStart(6, '0');
  }

  protected submit() {
    const barForm = this.form.getRawValue();
    if (this.form.valid && barForm) {
      const bar: AttributeBar = {
        id: this.bar()?.id || '',
        type: 'bar',
        name: barForm.name,
        color: barForm.color,
        min: barForm.min,
        max: barForm.max,
        current: barForm.current,
      };

      this.newBar.emit(bar);
    }
  }

  protected delete() {
    const existingBar = this.bar();
    if (existingBar) {
      this.deleteBar.emit(existingBar);
    }
  }
}
