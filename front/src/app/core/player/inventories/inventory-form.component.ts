import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AttributeInventory } from '@pagemaster/common/attributes.types';
import { ButtonComponent } from '../../design-system/button.component';

interface InventoryFormType {
  name: FormControl<string>,
  isSecret: FormControl<boolean>,
  capacityType: FormControl<'state' | 'weight'>,
  capacityState: FormControl<'empty' | 'partial' | 'full'>,
  capacityWeight: FormControl<number>,
  capacityMaxWeight: FormControl<number>,
}

@Component({
  selector: 'app-inventory-form',
  template: `
    <h2>{{ inventory() ? 'Edit' : 'Create a new' }} Inventory</h2>
    <form [formGroup]="form" (ngSubmit)="submit()">
      
      <label for="name">Name</label>
      <input id="name" [formControl]="form.controls.name" type="text" />

      <label>
        <input type="checkbox" [formControl]="form.controls.isSecret" />
        Secret Inventory
      </label>
      
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
      
      <div class="button-group">
        <ds-button 
          [mode]="'primary'" 
          (click)="submit()" 
          [state]="form.invalid ? {state: 'error', message: 'Form is invalid'} : {state: 'default'}">
          {{ inventory() ? 'Update' : 'Create' }} Inventory
        </ds-button>
        @if (inventory() && permissions().delete) {
          <ds-button [mode]="'primary-danger'" (click)="delete()">Delete</ds-button>
        }
      </div>
    </form>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--gap-medium);
      width: 100%;
    }

    h2 {
      margin: 0 0 var(--gap-medium) 0;
      color: var(--text-primary);
      font-size: var(--text-size-large);
      font-weight: var(--text-weight-bold);
    }

    form {
      display: flex;
      flex-direction: column;
      gap: var(--gap-medium);
    }

    label {
      font-size: var(--text-size-small);
      color: var(--text-secondary);
      font-weight: var(--text-weight-medium);
      margin-bottom: var(--gap-small);
      display: flex;
      align-items: center;
      gap: var(--gap-small);
    }

    input[type="text"],
    input[type="number"],
    select {
      width: 100%;
      padding: var(--padding-small);
      background-color: var(--color-background-tertiary);
      border: var(--view-border);
      border-radius: var(--view-border-radius);
      color: var(--text-primary);
      font-size: var(--text-size-medium);
      transition: border-color var(--transition-speed);
    }

    input[type="text"]:focus,
    input[type="number"]:focus,
    select:focus {
      outline: none;
      border-color: var(--color-primary);
    }

    input[type="checkbox"] {
      width: auto;
      cursor: pointer;
    }

    select {
      cursor: pointer;
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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryFormComponent {
  public inventory = input<AttributeInventory>();
  public permissions = input<{delete: boolean}>({delete: false});
  public newInventory = output<AttributeInventory>();
  public deleteInventory = output<AttributeInventory>();
  private fb = inject(FormBuilder);
  
  protected form = this.fb.group<InventoryFormType>({
    name: this.fb.control('', { nonNullable: true, validators: [Validators.required]}),
    isSecret: this.fb.control(false, { nonNullable: true }),
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
