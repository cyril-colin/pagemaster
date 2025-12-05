import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AttributeStatus } from '@pagemaster/common/attributes.types';
import { ButtonComponent } from '../../design-system/button.component';
import {
  ModalLayoutComponent,
  ModalLayoutFooterComponent,
  ModalLayoutHeaderComponent,
  ModalLayoutSectionComponent,
} from '../../modal/modal-layout';

interface StatusFormType {
  color: FormControl<string>,
  name: FormControl<string>,
  description: FormControl<string>,
}

@Component({
  template: `
    <ds-modal-layout>
      <ds-modal-layout-header [title]="status()?.name || 'Create a new Status'">
        @if (status() && permissions().delete) {
            <ds-button [mode]="'primary-danger'" [icon]="'empty'" (click)="delete()" />
          }
      </ds-modal-layout-header>
      
      <ds-modal-layout-section>
          <form [formGroup]="form" (ngSubmit)="submit()">
            <label for="name">Name</label>
            <input id="name" [formControl]="form.controls.name" type="text" />
            
            <label for="color">Color</label>
            <input id="color" [formControl]="form.controls.color" type="color" />
            
            <label for="description">Description</label>
            <textarea id="description" [formControl]="form.controls.description"></textarea>
          </form>
          
      </ds-modal-layout-section>

      <ds-modal-layout-footer>
        <ds-button 
          [mode]="'primary'" 
          (click)="submit()" 
          [state]="form.invalid ? {state: 'error', message: 'Form is invalid'} : {state: 'default'}">
          {{ status() ? 'Update' : 'Create' }} Status
        </ds-button>
      </ds-modal-layout-footer>
      
    </ds-modal-layout>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
    }
  `],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    ModalLayoutComponent,
    ModalLayoutHeaderComponent,
    ModalLayoutSectionComponent,
    ModalLayoutFooterComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusFormModalComponent {
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
