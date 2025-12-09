import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AttributeBar } from '@pagemaster/common/attributes.types';
import { CurrentParticipantState } from '../../current-participant.state';
import { ButtonComponent } from '../../design-system/button.component';
import {
    ModalLayoutComponent,
    ModalLayoutFooterComponent,
    ModalLayoutHeaderComponent,
    ModalLayoutSectionComponent,
} from '../../modal/modal-layout';

interface QuickBarFormType {
  color: FormControl<string>,
  name: FormControl<string>,
  min: FormControl<number>,
  max: FormControl<number>,
  current: FormControl<number>,
}

@Component({
  selector: 'app-quick-bar-creation-modal',
  template: `
    <ds-modal-layout>
      <ds-modal-layout-header [title]="isEditMode() ? 'Create New Quick Bar' : 'View Bar'">
      </ds-modal-layout-header>
      
      <ds-modal-layout-section>
        <form [formGroup]="form">
          <label for="name">Name</label>
          <input 
            id="name" 
            [formControl]="form.controls.name" 
            type="text" 
            placeholder="e.g., Health, Mana, Stamina" 
            [readonly]="!isEditMode()" />
          
          <label for="color">Color</label>
          <input 
            id="color" 
            [formControl]="form.controls.color" 
            type="color" 
            [disabled]="!isEditMode()" />
          
          <div class="form-row">
            <div class="form-field">
              <label for="min">Min Value</label>
              <input 
                id="min" 
                [formControl]="form.controls.min" 
                type="number" 
                placeholder="0" 
                [readonly]="!isEditMode()" />
            </div>
            
            <div class="form-field">
              <label for="max">Max Value</label>
              <input 
                id="max" 
                [formControl]="form.controls.max" 
                type="number" 
                placeholder="100" 
                [readonly]="!isEditMode()" />
            </div>
            
            <div class="form-field">
              <label for="current">Current Value</label>
              <input 
                id="current" 
                [formControl]="form.controls.current" 
                type="number" 
                placeholder="100" 
                [readonly]="!isEditMode()" />
            </div>
          </div>
        </form>
        @if (isEditMode()) {
          <p class="info-text">This bar will be added to quick values and available for all players.</p>
        } @else {
          <p class="info-text">You can only view this bar. Only the Game Master can create quick values.</p>
        }
      </ds-modal-layout-section>

      <ds-modal-layout-footer>
        @if (isEditMode()) {
          <ds-button 
            [mode]="'primary'" 
            (click)="submit()" 
            [state]="form.invalid ? {state: 'error', message: 'Form is invalid'} : {state: 'default'}">
            Create Quick Bar
          </ds-button>
        }
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

    .form-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--gap-medium);
    }

    .form-field {
      display: flex;
      flex-direction: column;
    }

    .form-field label {
      margin-bottom: var(--gap-small);
    }

    input[readonly] {
      opacity: 0.7;
      cursor: default;
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
export class QuickBarCreationModalComponent {
  public existingBar = input<AttributeBar | undefined>();
  public quickBarCreated = output<AttributeBar>();
  
  private fb = inject(FormBuilder);
  private currentParticipantState = inject(CurrentParticipantState);
  
  protected isEditMode = computed(() => {
    // View-only mode if existingBar is provided OR if not allowed to edit
    return !this.existingBar() && this.currentParticipantState.allowedToEditPlayerSnapshot();
  });
  
  protected form = this.fb.group<QuickBarFormType>({
    color: this.fb.control(
      this.existingBar()?.color ?? this.generateRandomColor(),
      { nonNullable: true, validators: [Validators.required]},
    ),
    name: this.fb.control(
      this.existingBar()?.name ?? '',
      { nonNullable: true, validators: [Validators.required]},
    ),
    min: this.fb.control(
      this.existingBar()?.min ?? 0,
      { nonNullable: true, validators: [Validators.required]},
    ),
    max: this.fb.control(
      this.existingBar()?.max ?? 100,
      { nonNullable: true, validators: [Validators.required]},
    ),
    current: this.fb.control(
      this.existingBar()?.current ?? 100,
      { nonNullable: true, validators: [Validators.required]},
    ),
  });

  private generateRandomColor(): string {
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    return '#' + randomColor.padStart(6, '0');
  }

  protected submit() {
    const barForm = this.form.getRawValue();
    if (this.form.valid && barForm) {
      const bar: AttributeBar = {
        id: `bar-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: 'bar',
        color: barForm.color,
        name: barForm.name,
        min: barForm.min,
        max: barForm.max,
        current: barForm.current,
      };

      this.quickBarCreated.emit(bar);
    }
  }
}
