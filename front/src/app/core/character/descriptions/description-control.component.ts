import { ChangeDetectionStrategy, Component, effect, ElementRef, inject, input, output, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { DescriptionViewComponent } from './description-view.component';

export type DescriptionPermissions = {
  edit: boolean,
};

@Component({
  selector: 'app-description-control',
  template: `
    @if(mode() === 'view') {
      <div (click)="setMode('edit')" [class.description-view]="permissions().edit" [class.description-readonly]="!permissions().edit">
        <app-description-view [description]="descriptionForm().controls.description.value"></app-description-view>
      </div>
    } @else {
      <div class="edit-container">
        <div class="editor-header">
          <button 
            type="button" 
            class="tab-button" 
            [class.active]="editorTab() === 'edit'"
            (click)="editorTab.set('edit')">
            Edit
          </button>
          <button 
            type="button" 
            class="tab-button" 
            [class.active]="editorTab() === 'preview'"
            (click)="editorTab.set('preview')">
            Preview
          </button>
        </div>
        @if(editorTab() === 'edit') {
          <textarea 
            #input 
            [formControl]="descriptionForm().controls.description" 
            placeholder="Use markdown formatting (e.g., **bold**, *italic*, # heading)">
          </textarea>
        } @else {
          <div class="preview-container">
            <app-description-view [description]="descriptionForm().controls.description.value"></app-description-view>
          </div>
        }
        <div class="button-group">
          <button type="button" (click)="submit()">Save</button>
          <button type="button" (click)="cancel()">Cancel</button>
        </div>
      </div>
    }
  `,
  styles: [`
    .description-view {
      cursor: pointer;
      width: 100%;
    }

    .description-readonly {
      width: 100%;
    }

    .edit-container {
      width: 100%;
    }

    .editor-header {
      display: flex;
      gap: 2px;
      margin-bottom: var(--gap-small);
      border-bottom: 1px solid var(--view-border);
    }

    .tab-button {
      padding: var(--gap-small) var(--gap-medium);
      border: none;
      border-bottom: 2px solid transparent;
      background: transparent;
      color: var(--text-secondary);
      cursor: pointer;
      font-size: var(--text-size-small);
      transition: all 0.2s;
    }

    .tab-button:hover {
      color: var(--text-primary);
    }

    .tab-button.active {
      color: var(--text-primary);
      border-bottom-color: var(--color-primary);
    }
    
    textarea {
      width: 100%;
      min-height: 120px;
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

    .preview-container {
      width: 100%;
      min-height: 120px;
      padding: var(--gap-small);
      border: var(--view-border);
      border-radius: var(--view-border-radius);
      background: var(--background-secondary);
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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DescriptionControlComponent {
  public description = input<string>('');
  public permissions = input.required<DescriptionPermissions>();
  public newDescription = output<{value: string}>();
  protected input = viewChild.required('input', { read: ElementRef<HTMLTextAreaElement> });
  protected mode = signal<'view' | 'edit'>('view');
  protected editorTab = signal<'edit' | 'preview'>('edit');
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
      this.editorTab.set('edit');
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
