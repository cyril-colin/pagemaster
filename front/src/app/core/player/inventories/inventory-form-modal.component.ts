import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AttributeInventory } from '@pagemaster/common/attributes.types';
import { ButtonComponent } from '../../design-system/button.component';
import {
  ModalLayoutComponent,
  ModalLayoutFooterComponent,
  ModalLayoutHeaderComponent,
  ModalLayoutSectionComponent,
} from '../../modal/modal-layout';

interface InventoryFormType {
  name: FormControl<AttributeInventory['name']>,
  isSecret: FormControl<AttributeInventory['isSecret']>,
  mode: FormControl<AttributeInventory['mode']>,
  capacityType: FormControl<AttributeInventory['capacity']['type']>,
  capacityState: FormControl<'empty' | 'partial' | 'full'>,
  capacityWeight: FormControl<number>,
  capacityMaxWeight: FormControl<number>,
}

@Component({
  template: `
    <ds-modal-layout>
      <ds-modal-layout-header [title]="inventory()?.name || 'Create a new Inventory'">
        @if (inventory() && permissions().delete) {
            <ds-button [mode]="'primary-danger'" [icon]="'empty'" (click)="delete()" />
          }
      </ds-modal-layout-header>

      <ds-modal-layout-section>
        <form [formGroup]="form" (ngSubmit)="submit()">
      
          <label for="name">Name</label>
          <input id="name" [formControl]="form.controls.name" type="text" />

          <label>
            <input type="checkbox" [formControl]="form.controls.isSecret" />
            Secret Inventory
          </label>

          <label for="mode">Mode</label>
          <select id="mode" [formControl]="form.controls.mode">
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>

          <label for="capacityType">Capacity Type</label>
          <select id="capacityType" [formControl]="form.controls.capacityType">
            <option value="state">State (Empty/Partial/Full)</option>
            <option value="weight">Weight</option>
          </select>
          
          <label for="capacityType">Capacity Type</label>
          <select id="capacityType" [formControl]="form.controls.capacityType">
            <option value="state">State (Empty/Partial/Full)</option>
            <option value="weight">Weight</option>
          </select>

          @if (form.controls.capacityType.value === 'state') {
            <label for="capacityState">Capacity State</label>
            <select id="capacityState" [formControl]="form.controls.capacityState">
              <option value="empty">Empty</option>
              <option value="partial">Partial</option>
              <option value="full">Full</option>
            </select>
          }

          @if (form.controls.capacityType.value === 'weight') {
            <label for="capacityWeight">Current Weight</label>
            <input id="capacityWeight" [formControl]="form.controls.capacityWeight" type="number" min="0" />
            
            <label for="capacityMaxWeight">Maximum Weight</label>
            <input id="capacityMaxWeight" [formControl]="form.controls.capacityMaxWeight" type="number" min="1" />
          }
          

        </form>
      </ds-modal-layout-section>

      <ds-modal-layout-footer>
        <ds-button 
          [mode]="'primary'" 
          (click)="submit()" 
          [state]="form.invalid ? {state: 'error', message: 'Form is invalid'} : {state: 'default'}">
          {{ inventory() ? 'Update' : 'Create' }} Inventory
        </ds-button>
      </ds-modal-layout-footer>
    </ds-modal-layout>

    
  `,
  styles: [`
    :host {
      width: 100%;
      height: 100%;
    }

    h2 {
      margin: 0 0 var(--gap-medium) 0;
      color: var(--text-primary);
      font-size: var(--text-size-large);
      font-weight: var(--text-weight-bold);
    }

    .button-group {
      display: flex;
      gap: var(--gap-medium);
    }

    .button-group ds-button {
      flex: 1;
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
export class InventoryFormModalComponent {
  public inventory = input<AttributeInventory>();
  public permissions = input<{delete: boolean}>({delete: false});
  public newInventory = output<AttributeInventory>();
  public deleteInventory = output<AttributeInventory>();
  private fb = inject(FormBuilder);
  
  protected form = this.fb.group<InventoryFormType>({
    name: this.fb.control('', { nonNullable: true, validators: [Validators.required]}),
    isSecret: this.fb.control(false, { nonNullable: true }),
    mode: this.fb.control<'small' | 'medium' | 'large'>('medium', { nonNullable: true, validators: [Validators.required]}),
    capacityType: this.fb.control<'state' | 'weight'>('state', { nonNullable: true, validators: [Validators.required]}),
    capacityState: this.fb.control<'empty' | 'partial' | 'full'>('empty', { nonNullable: true }),
    capacityWeight: this.fb.control(0, { nonNullable: true }),
    capacityMaxWeight: this.fb.control(100, { nonNullable: true }),
  });

  constructor() {
    effect(() => {
      const existingInventory = this.inventory();
      if (existingInventory) {
        this.form.patchValue({
          name: existingInventory.name,
          isSecret: existingInventory.isSecret,
          capacityType: existingInventory.capacity.type,
          capacityState: existingInventory.capacity.type === 'state' ? existingInventory.capacity.value : 'empty',
          capacityWeight: existingInventory.capacity.type === 'weight' ? existingInventory.capacity.value : 0,
          capacityMaxWeight: existingInventory.capacity.type === 'weight' ? existingInventory.capacity.max : 100,
        });
      }
    });
  }

  protected submit() {
    const inventoryForm = this.form.getRawValue();
    if (this.form.valid && inventoryForm) {
      const capacity = inventoryForm.capacityType === 'state'
        ? { type: 'state' as const, value: inventoryForm.capacityState }
        : { type: 'weight' as const, value: inventoryForm.capacityWeight, max: inventoryForm.capacityMaxWeight };

      const inventory: AttributeInventory = {
        id: this.inventory()?.id || '',
        type: 'inventory',
        mode: inventoryForm.mode,
        name: inventoryForm.name,
        isSecret: inventoryForm.isSecret,
        capacity,
        current: this.inventory()?.current || [],
      };

      this.newInventory.emit(inventory);
    }
  }

  protected delete() {
    const existingInventory = this.inventory();
    if (existingInventory) {
      this.deleteInventory.emit(existingInventory);
    }
  }
}
