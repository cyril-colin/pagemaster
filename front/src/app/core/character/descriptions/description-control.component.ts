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
      <textarea #input [formControl]="descriptionForm().controls.description" (blur)="submit()" (keyup.enter)="submit()"></textarea>
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
    
    textarea {
      width: 100%;
      min-height: 60px;
      font-size: var(--text-size-medium);
      font-weight: var(--text-weight-normal);
      padding: var(--gap-small);
      border: var(--view-border);
      border-radius: var(--view-border-radius);
      background: transparent;
      color: var(--text-primary);
      resize: vertical;
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
}
