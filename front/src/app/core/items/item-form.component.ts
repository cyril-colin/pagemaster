import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Item } from '../../../pagemaster-schemas/src/items.types';

export type ItemFormControls = {
  id: FormControl<string>,
  picture: FormControl<string>,
  name: FormControl<string>,
  description: FormControl<string>,
  weight: FormControl<number>,
}


@Component({
  selector: 'app-item-form',
  template: `
    <h1>Item Form</h1>
    
    <div>
      <label for="id">ID:</label>
      <input 
        id="id" 
        type="text" 
        [formControl]="form().controls.id"
        placeholder="Enter item ID">
    </div>

    <div>
      <label for="picture">Picture URL:</label>
      <input 
        id="picture" 
        type="text" 
        [formControl]="form().controls.picture"
        placeholder="Enter picture URL">
    </div>

    <div>
      <label for="name">Name:</label>
      <input 
        id="name" 
        type="text" 
        [formControl]="form().controls.name"
        placeholder="Enter item name">
    </div>

    <div>
      <label for="description">Description:</label>
      <textarea 
        id="description" 
        [formControl]="form().controls.description"
        placeholder="Enter item description"
        rows="3">
      </textarea>
    </div>

    <div>
      <label for="weight">Weight:</label>
      <input 
        id="weight" 
        type="number" 
        [formControl]="form().controls.weight"
        placeholder="Enter item weight"
        min="0"
        step="0.1">
    </div>

    <div>
      <button type="button" (click)="submit()">
        Submit Item
      </button>
    </div>
  `,
  imports: [
    ReactiveFormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemFormComponent {
  protected fb = inject(FormBuilder);

  public item = input<Item>();
  public newItem = output<Item>();

  protected form = computed(() => {
    const currentItem = this.item();
    return this.fb.group<ItemFormControls>({
      id: this.fb.control(currentItem?.id || '', { nonNullable: true }),
      picture: this.fb.control(currentItem?.picture || '', { nonNullable: true }),
      name: this.fb.control(currentItem?.name || '', { nonNullable: true }),
      description: this.fb.control(currentItem?.description || '', { nonNullable: true }),
      weight: this.fb.control(currentItem?.weight || 0, { nonNullable: true }),
    });
  });

  public submit() {
    if (this.form().valid) {
      this.newItem.emit(this.form().getRawValue());
    }
  }

}