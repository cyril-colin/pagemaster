import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AttributeStatus } from '@pagemaster/common/attributes.types';
import { ButtonComponent } from '../../design-system/button.component';

interface StatusFormType {
  color: FormControl<string>,
  name: FormControl<string>,
  description: FormControl<string>,
}

@Component({
  selector: 'app-status-form',
  template: `
    <h2>{{ status() ? 'Edit' : 'Create a new' }} Status</h2>
    <form [formGroup]="form" (ngSubmit)="submit()">
      
      <label for="name">Name</label>
      <input id="name" [formControl]="form.controls.name" type="text" />
      
      <label for="color">Color</label>
      <input id="color" [formControl]="form.controls.color" type="color" />
      
      <label for="description">Description</label>
      <textarea id="description" [formControl]="form.controls.description"></textarea>
      
      <div class="button-group">
        <ds-button 
          [mode]="'primary'" 
          (click)="submit()" 
          [state]="form.invalid ? {state: 'error', message: 'Form is invalid'} : {state: 'default'}">
          {{ status() ? 'Update' : 'Create' }} Status
        </ds-button>
        @if (status() && permissions().delete) {
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
    input[type="color"],
    textarea {
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
    input[type="color"]:focus,
    textarea:focus {
      outline: none;
      border-color: var(--color-primary);
    }

    input[type="text"]:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background-color: var(--color-background-secondary);
    }

    input[type="color"] {
      height: 40px;
      cursor: pointer;
      padding: var(--gap-small);
    }

    textarea {
      min-height: 80px;
      resize: vertical;
      font-family: inherit;
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
export class StatusFormComponent {
  public status = input<AttributeStatus>();
  public permissions = input<{delete: boolean}>({delete: false});
  public newStatus = output<AttributeStatus>();
  public deleteStatus = output<AttributeStatus>();
  private fb = inject(FormBuilder);
  
  protected form = this.fb.group<StatusFormType>({
    color: this.fb.control('#000000', { nonNullable: true, validators: [Validators.required]}),
    name: this.fb.control('', { nonNullable: true, validators: [Validators.required]}),
    description: this.fb.control('', { nonNullable: true, validators: []}),
  });

  constructor() {
    effect(() => {
      const existingStatus = this.status();
      if (existingStatus) {
        this.form.patchValue({
          color: existingStatus.color,
          name: existingStatus.name,
          description: existingStatus.description,
        });
      } else {
        // Set random color for new status
        this.form.controls.color.setValue(this.generateRandomColor());
      }
    });
  }

  private generateRandomColor(): string {
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    return '#' + randomColor.padStart(6, '0');
  }

  protected submit() {
    const statusForm = this.form.getRawValue();
    if (this.form.valid && statusForm) {
      const status: AttributeStatus = {
        id: this.status()?.id || '',
        type: 'status',
        color: statusForm.color,
        name: statusForm.name,
        description: statusForm.description,
      };

      this.newStatus.emit(status);
    }
  }

  protected delete() {
    const existingStatus = this.status();
    if (existingStatus) {
      this.deleteStatus.emit(existingStatus);
    }
  }
}
