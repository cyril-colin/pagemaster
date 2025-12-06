import { ChangeDetectionStrategy, Component, effect, ElementRef, inject, input, output, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { GameSessionPermissions } from '@pagemaster/common/permissions.types';
import { ButtonComponent } from '../../design-system/button.component';
import { DescriptionViewComponent } from './description-view.component';

@Component({
  selector: 'app-description-control',
  template: `
    <div class="description-wrapper">
      @if(mode() === 'view') {
        <div class="view-container">
          @if(permissions().edit) {
            <ds-button 
              [mode]="'tertiary'" 
              [icon]="'edit'"
              (click)="setMode('edit')"
              [attr.aria-label]="'Edit description'"
              class="edit-button">
            </ds-button>
          }
          <div class="description-view">
            <app-description-view [description]="descriptionForm().controls.description.value"></app-description-view>
          </div>
        </div>
      } @else {
        <div class="edit-container">
          <textarea 
            #input 
            [formControl]="descriptionForm().controls.description" 
            placeholder="Use markdown formatting (e.g., **bold**, *italic*, # heading)">
          </textarea>
          <div class="button-group">
            <button type="button" (click)="submit()">Save</button>
            <button type="button" (click)="cancel()">Cancel</button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .description-wrapper {
      width: 100%;
    }

    .view-container {
      position: relative;
      width: 100%;
    }

    .edit-button {
      position: absolute;
      top: 0;
      right: 0;
      z-index: 1;
    }
    
    .description-view {
      width: 100%;
    }

    .edit-container {
      width: 100%;
    }
    
    textarea {
      width: 100%;
      min-height: 500px;
      font-size: var(--text-size-medium);
      font-weight: var(--text-weight-normal);
      padding: var(--gap-small);
      border: var(--view-border);
      border-radius: var(--view-border-radius);
      background: transparent;
      color: var(--text-primary);
      resize: vertical;
      font-family: monospace;
    }

    .button-group {
      display: flex;
      gap: var(--gap-small);
      margin-top: var(--gap-small);
    }

    button {
      padding: var(--gap-small) var(--gap-medium);
      border: var(--view-border);
      border-radius: var(--view-border-radius);
      background: var(--background-secondary);
      color: var(--text-primary);
      cursor: pointer;
      font-size: var(--text-size-small);
    }

    button:hover {
      background: var(--background-tertiary);
    }
  `],
  imports: [
    ReactiveFormsModule,
    DescriptionViewComponent,
    ButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DescriptionControlComponent {
  public description = input<string>('');
  public permissions = input.required<GameSessionPermissions['description']>();
  public newDescription = output<{value: string}>();
  protected input = viewChild.required('input', { read: ElementRef<HTMLTextAreaElement> });
  protected mode = signal<'view' | 'edit'>('view');
  protected fb = inject(FormBuilder);
  protected descriptionForm = signal(this.createForm(this.description()));

  constructor() {
    effect(() => {
      this.descriptionForm().controls.description.setValue(this.description());
    });
  }

  private createForm(description: string) {
    return this.fb.group({ description: this.fb.control(description, {nonNullable: true}) });
  }

  protected setMode(newMode: 'view' | 'edit'): void {
    if (!this.permissions().edit && newMode === 'edit') {
      return;
    }
    this.mode.set(newMode);
    if (newMode === 'edit') {
      setTimeout(() => {
        (this.input().nativeElement as HTMLTextAreaElement).focus();
      });
    }
  }

  protected submit(): void {
    this.setMode('view');
    if (this.descriptionForm().valid && this.descriptionForm().controls.description.value !== this.description()) {
      this.newDescription.emit({ value: this.descriptionForm().controls.description.value });
    }
  }

  protected cancel(): void {
    this.descriptionForm().controls.description.setValue(this.description());
    this.setMode('view');
  }
}
