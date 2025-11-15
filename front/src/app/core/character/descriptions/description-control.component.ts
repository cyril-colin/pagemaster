import { ChangeDetectionStrategy, Component, effect, ElementRef, inject, input, output, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '../../design-system/button.component';
import { DescriptionViewComponent } from './description-view.component';

export type DescriptionPermissions = {
  edit: boolean,
};

export type DescriptionCollapseState = 'expanded' | 'collapsed';

@Component({
  selector: 'app-description-control',
  template: `
    <div class="description-wrapper">
      <ds-button 
        [mode]="'tertiary'" 
        [icon]="collapseState() === 'expanded' ? 'chevron-down' : 'chevron-up'"
        (click)="toggleCollapse()"
        [attr.aria-label]="collapseState() === 'expanded' ? 'Collapse' : 'Expand'"
        class="collapse-button">
      </ds-button>
      <div class="description-content" [class.collapsed]="collapseState() === 'collapsed'">
        @if(mode() === 'view') {
          <div (click)="setMode('edit')" [class.description-view]="permissions().edit" [class.description-readonly]="!permissions().edit">
            <app-description-view [description]="descriptionForm().controls.description.value"></app-description-view>
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
    </div>
  `,
  styles: [`
    .description-wrapper {
      display: flex;
      align-items: flex-start;
      gap: var(--gap-small);
      width: 100%;
    }

    .collapse-button {
      flex-shrink: 0;
    }

    .description-content {
      flex: 1;
      overflow: hidden;
      transition: max-height 0.3s ease;
    }

    .description-content.collapsed {
      max-height: 7.5em; /* ~5 lines at standard line-height of 1.5 */
      position: relative;
    }

    .description-content.collapsed::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2em;
      background: linear-gradient(to bottom, transparent, var(--background-primary));
      pointer-events: none;
    }
    
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
  public permissions = input.required<DescriptionPermissions>();
  public newDescription = output<{value: string}>();
  public initialCollapseState = input<DescriptionCollapseState>('collapsed');
  protected input = viewChild.required('input', { read: ElementRef<HTMLTextAreaElement> });
  protected mode = signal<'view' | 'edit'>('view');
  protected collapseState = signal<DescriptionCollapseState>('expanded');
  protected fb = inject(FormBuilder);
  protected descriptionForm = signal(this.createForm(this.description()));

  constructor() {
    effect(() => {
      this.descriptionForm().controls.description.setValue(this.description());
    });
    effect(() => {
      this.collapseState.set(this.initialCollapseState());
    });
  }

  protected toggleCollapse(): void {
    this.collapseState.set(this.collapseState() === 'expanded' ? 'collapsed' : 'expanded');
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
      this.collapseState.set('expanded');
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
