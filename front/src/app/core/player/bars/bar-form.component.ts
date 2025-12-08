import { DialogRef } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AttributeBar } from '@pagemaster/common/attributes.types';
import {
    EventPlayerBarAdd,
    EventPlayerBarDelete,
    EventPlayerBarEdit,
    EventPlayerTypes,
} from '@pagemaster/common/events-player.types';
import { tap } from 'rxjs';
import { ButtonComponent } from '../../design-system/button.component';
import { ModalService } from '../../modal';
import {
    ModalLayoutComponent,
    ModalLayoutFooterComponent,
    ModalLayoutHeaderComponent,
    ModalLayoutSectionComponent,
} from '../../modal/modal-layout';
import { AbstractPlayerControl } from '../abstract-player-control';

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
        @if (bar() && permissions().bars.delete) {
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
export class BarFormComponent extends AbstractPlayerControl {
  public bar = input<AttributeBar>();
  protected dialogRef = inject(DialogRef);
  protected modalService = inject(ModalService);
  private fb = inject(FormBuilder);
  
  protected form = this.fb.group<BarFormType>({
    name: this.fb.control('', { nonNullable: true, validators: [Validators.required]}),
    color: this.fb.control('#000000', { nonNullable: true, validators: [Validators.required]}),
    min: this.fb.control(0, { nonNullable: true, validators: [Validators.required]}),
    max: this.fb.control(100, { nonNullable: true, validators: [Validators.required]}),
    current: this.fb.control(100, { nonNullable: true, validators: [Validators.required]}),
  });

  constructor() {
    super();
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

      this.saveBar(bar).pipe(
        tap(() => this.dialogRef.close()),
      ).subscribe();
    }
  }

  protected async delete() {
    const barName = this.bar()?.name;
    const result = await this.modalService.confirmation(
      `Are you sure you want to delete the bar "${barName}"? This action cannot be undone.`,
      `Confirm deletion of "${barName}"`,
    );
      
    if (result === 'confirmed') {
      const command = this.prepareEvent(EventPlayerTypes.PLAYER_BAR_DELETE) as Omit<EventPlayerBarDelete, 'id' | 'timestamp'>;
      command.barId = this.bar()?.id || '';
      this.gameEventRepository.postCommand(command).pipe(
        tap(() => this.dialogRef.close()),
      ).subscribe();
    }
  }

  protected saveBar(newBar: AttributeBar) {
    const isUpdate = !!this.bar();

    if (isUpdate) {
      return this.updateBar(newBar);
    }
    const command = this.prepareEvent(EventPlayerTypes.PLAYER_BAR_ADD) as Omit<EventPlayerBarAdd, 'id' | 'timestamp'>;
    command.newBar = newBar;
    return this.gameEventRepository.postCommand(command);
  }

  protected updateBar(updatedBar: AttributeBar) {
    const command = this.prepareEvent(EventPlayerTypes.PLAYER_BAR_EDIT) as Omit<EventPlayerBarEdit, 'id' | 'timestamp'>;
    command.newBar = updatedBar;
    return this.gameEventRepository.postCommand(command);
  }
}
