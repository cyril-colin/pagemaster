import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AttributeStatus } from '@pagemaster/common/attributes.types';
import { ButtonComponent } from '../../design-system/button.component';
import {
  ModalLayoutComponent,
  ModalLayoutFooterComponent,
  ModalLayoutHeaderComponent,
  ModalLayoutSectionComponent,
} from '../../modal/modal-layout';

interface QuickStatusFormType {
  color: FormControl<string>,
  name: FormControl<string>,
  description: FormControl<string>,
}

@Component({
  selector: 'app-quick-status-creation-modal',
  template: `
    <ds-modal-layout>
      <ds-modal-layout-header [title]="'Create New Quick Status'">
      </ds-modal-layout-header>
      
      <ds-modal-layout-section>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <label for="name">Name</label>
          <input id="name" [formControl]="form.controls.name" type="text" placeholder="e.g., ☢️ Radiation" />
          
          <label for="color">Color</label>
          <input id="color" [formControl]="form.controls.color" type="color" />
          
          <label for="description">Description</label>
          <textarea id="description" [formControl]="form.controls.description" placeholder="Optional description"></textarea>
        </form>
        <p class="info-text">This status will be added to quick values and available for all players.</p>
      </ds-modal-layout-section>

      <ds-modal-layout-footer>
        <ds-button 
          [mode]="'primary'" 
          (click)="submit()" 
          [state]="form.invalid ? {state: 'error', message: 'Form is invalid'} : {state: 'default'}">
          Create Quick Status
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

    .info-text {
      margin-top: var(--gap-medium);
      font-size: 0.9em;
      color: var(--color-text-secondary);
      font-style: italic;
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
export class QuickStatusCreationModalComponent {
  public quickStatusCreated = output<AttributeStatus>();
  private fb = inject(FormBuilder);
  
  protected form = this.fb.group<QuickStatusFormType>({
    color: this.fb.control(this.generateRandomColor(), { nonNullable: true, validators: [Validators.required]}),
    name: this.fb.control('', { nonNullable: true, validators: [Validators.required]}),
    description: this.fb.control('', { nonNullable: true, validators: []}),
  });

  private generateRandomColor(): string {
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    return '#' + randomColor.padStart(6, '0');
  }

  protected submit() {
    const statusForm = this.form.getRawValue();
    if (this.form.valid && statusForm) {
      const status: AttributeStatus = {
        id: `status-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: 'status',
        color: statusForm.color,
        name: statusForm.name,
        description: statusForm.description,
      };

      this.quickStatusCreated.emit(status);
    }
  }
}
