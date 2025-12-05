import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AttributeBar } from '@pagemaster/common/attributes.types';
import { ButtonComponent } from '../../design-system/button.component';
import {
  ModalLayoutComponent,
  ModalLayoutFooterComponent,
  ModalLayoutHeaderComponent,
  ModalLayoutSectionComponent,
} from '../../modal/modal-layout';

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
    <ds-modal-layout>
      <ds-modal-layout-header [title]="bar()?.name || 'Create a new Bar'">
        @if (bar() && permissions().delete) {
            <ds-button [mode]="'primary-danger'" [icon]="'empty'" (click)="delete()" />
          }
      </ds-modal-layout-header>

      <ds-modal-layout-section>
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
        </form>
      </ds-modal-layout-section>
        
      <ds-modal-layout-footer>
        <ds-button 
          [mode]="'primary'" 
          (click)="submit()" 
          [state]="form.invalid ? {state: 'error', message: 'Form is invalid'} : {state: 'default'}">
          {{ bar() ? 'Update' : 'Create' }} Bar
        </ds-button>
      </ds-modal-layout-footer>
    </ds-modal-layout>

    
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--gap-medium);
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
