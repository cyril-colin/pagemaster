import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { EventPlayerNameEdit, EventPlayerTypes } from '@pagemaster/common/events-player.types';
import { AbstractPlayerControl } from '../abstract-player-control';
import { NameViewComponent } from './name-view.component';

@Component({
  selector: 'app-name-control',
  template: `
    @if(mode() === 'view') {
      <div (click)="setMode('edit')" [class.name-view]="permissions().name.edit" [class.name-readonly]="!permissions().name.edit">
        <app-name-view [name]="nameForm().controls.name.value"></app-name-view>
      </div>
    } @else {
      <input 
        #input
        type="text"
        [formControl]="nameForm().controls.name"
        (blur)="submit()"
        (keydown.enter)="$event.preventDefault(); triggerBlur()"
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
export class NameControlComponent extends AbstractPlayerControl {
  protected input = viewChild.required('input', { read: ElementRef<HTMLInputElement> });
  protected mode = signal<'view' | 'edit'>('view');
  protected fb = inject(FormBuilder);
  protected nameForm = linkedSignal(() => this.createForm(this.player().name));

  constructor() {
    super();
    effect(() => {
      this.nameForm().controls.name.setValue(this.player().name);
    });
  }

  private createForm(name: string) {
    return this.fb.group({ name: this.fb.control(name, {nonNullable: true}) });
  }

  protected setMode(newMode: 'view' | 'edit'): void {
    if (!this.permissions().name.edit && newMode === 'edit') {
      return;
    }
    this.mode.set(newMode);
    if (newMode === 'edit') {
      setTimeout(() => {
        (this.input().nativeElement as HTMLInputElement).focus();
      });
    }
  }

  protected triggerBlur() {
    (this.input().nativeElement as HTMLInputElement).blur();
  }

  protected submit(): void {
    this.setMode('view');
    if (this.nameForm().valid && this.nameForm().controls.name.value !== this.player().name) {
      this.renameParticipant(this.nameForm().controls.name.value).subscribe();
    }
  }

  protected renameParticipant(newName: string) {
    const command = { ...this.prepareEvent(EventPlayerTypes.PLAYER_NAME_EDIT), newName } as EventPlayerNameEdit;

    return this.gameEventRepository.postCommand(command);
  }
}
