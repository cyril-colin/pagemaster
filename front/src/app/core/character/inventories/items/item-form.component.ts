import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, output } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Item } from '@pagemaster/common/items.types';
import { ITEM_ICONS } from 'src/app/core/gallery/item-icons.const';
import { PictureGalleryComponent } from 'src/app/core/gallery/picture-gallery.component';

type ItemFormControl = {
  name: FormControl<string>,
  description: FormControl<string>,
  weight: FormControl<number>,
  picture: FormControl<string>,
}


@Component({
  selector: 'app-item-form',
  template: `
    @let itemForm = form();
    <div class="item-form">
      @if(pictureMode() === 'edit') {
        <div class="form-field">
          <label for="picture">Picture:</label>
          <app-picture-gallery [items]="pictures" (itemSelected)="pictureMode.set('view'); selectPicture($event)"/>
        </div>
      }
      @if(pictureMode() === 'view') {
        <div class="form-field">
          <label for="picture-preview">Picture Preview:</label>
          <img [src]="itemForm.controls.picture.value" alt="Selected Picture" width="64" height="64"/>
          <button (click)="pictureMode.set('edit')">Change Picture</button>
        </div>
      }
      <div class="form-field">
        <label for="name">Name:</label>
        <input 
          id="name" 
          type="text" 
          [formControl]="itemForm.controls.name"
          placeholder="Enter item name">
      </div>

      <div class="form-field">
        <label for="description">Description:</label>
        <textarea 
          id="description" 
          [formControl]="itemForm.controls.description"
          placeholder="Enter item description"
          rows="3">
        </textarea>
      </div>

      <div class="form-field">
        <label for="weight">Weight:</label>
        <input 
          id="weight" 
          type="number" 
          [formControl]="itemForm.controls.weight"
          placeholder="Enter item weight"
          min="0"
          step="0.1">
      </div>

      

      <div class="form-actions">
        <button type="button" (click)="submit()">
          Submit
        </button>
      </div>
    </div>
  `,
  styles: [`
    .item-form {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .form-field {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .form-field label {
      font-weight: 500;
      color: var(--text-primary);
    }
    
    .form-field input,
    .form-field textarea {
      padding: 8px;
      border: 1px solid var(--border-color, #ccc);
      border-radius: 4px;
      font-family: inherit;
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
    
    .form-actions button {
      padding: 8px 16px;
      background-color: var(--primary-color, #007bff);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }
    
    .form-actions button:hover {
      opacity: 0.9;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PictureGalleryComponent, ReactiveFormsModule],
})
export class ItemFormComponent {
  public existingItem = input<Item | null>(null);
  public itemSubmitted = output<Item>();
  protected pictureMode = linkedSignal<'view' | 'edit'>(() => {
    return this.existingItem() ? 'view' : 'edit';
  });
  protected pictures = ITEM_ICONS;
  protected fb = inject(FormBuilder);
  
  protected form = computed(() => {
    const existingCharacter = this.existingItem();
    return this.fb.group<ItemFormControl>({
      name: this.fb.control(existingCharacter?.name ?? '', { nonNullable: true }),
      description: this.fb.control(existingCharacter?.description ?? '', { nonNullable: true }),
      weight: this.fb.control(existingCharacter?.weight ?? 0, { nonNullable: true }),
      picture: this.fb.control(existingCharacter?.picture ?? '', { nonNullable: true }),
    });
  });

  protected selectPicture(picture: { name: string, path: string }) {
    
    this.form().controls.picture.setValue(picture.path);
    if (this.existingItem()) {
      return;
    }
    if (!this.form().controls.name.value) {
      this.form().controls.name.setValue(picture.name);
    }
    if (!this.form().controls.description.value) {
      this.form().controls.description.setValue(picture.name);
    }
  }
  
  protected submit() {
    const formValue = this.form().value;
    const item: Item = {
      id: this.existingItem()?.id ?? `${formValue.name}-${Date.now()}`,
      name: formValue.name ?? '',
      description: formValue.description ?? '',
      weight: formValue.weight ?? 0,
      picture: formValue.picture ?? '',
    };
    this.itemSubmitted.emit(item);
  }
  
}