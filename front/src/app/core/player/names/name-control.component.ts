import { ChangeDetectionStrategy, Component, effect, ElementRef, inject, input, output, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NameViewComponent } from './name-view.component';

export type NamePermissions = {
  edit: boolean,
};

@Component({
  selector: 'app-name-control',
  template: `
    @if(mode() === 'view') {
      <div (click)="setMode('edit')" [class.name-view]="permissions().edit" [class.name-readonly]="!permissions().edit">
        <app-name-view [name]="nameForm().controls.name.value"></app-name-view>
      </div>
    } @else {
      <input 
        #input
        type="text"
        [formControl]="nameForm().controls.name"
        (blur)="submit()"
        (keydown.enter)="$event.preventDefault(); submit()"
      />
    }
  `,
  styles: [`
    .name-view {
      cursor: pointer;
      width: 100%;
    }

    .name-readonly {
      width: 100%;
    }
    
    input {
      width: 100%;
      font-size: var(--text-size-large);
      font-weight: var(--text-weight-bold);
      padding: var(--gap-small);
      border: var(--view-border);
      border-radius: var(--view-border-radius);
      background: transparent;
      color: var(--text-primary);
    }
  `],
  imports: [
    ReactiveFormsModule,
    NameViewComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NameControlComponent {
  public name = input<string>('');
  public permissions = input.required<NamePermissions>();
  public newName = output<{value: string}>();
  protected input = viewChild.required('input', { read: ElementRef<HTMLInputElement> });
  protected mode = signal<'view' | 'edit'>('view');
  protected fb = inject(FormBuilder);
  protected nameForm = signal(this.createForm(this.name()));

  constructor() {
    effect(() => {
      this.nameForm().controls.name.setValue(this.name());
    });
  }

  private createForm(name: string) {
    return this.fb.group({ name: this.fb.control(name, {nonNullable: true}) });
  }

  protected setMode(newMode: 'view' | 'edit'): void {
    if (!this.permissions().edit && newMode === 'edit') {
      return;
    }
    this.mode.set(newMode);
    if (newMode === 'edit') {
      setTimeout(() => {
        (this.input().nativeElement as HTMLInputElement).focus();
      });
    }
  }

  protected submit(): void {
    this.setMode('view');
    if (this.nameForm().valid && this.nameForm().controls.name.value !== this.name()) {
      this.newName.emit({ value: this.nameForm().controls.name.value });
    }
  }
}
