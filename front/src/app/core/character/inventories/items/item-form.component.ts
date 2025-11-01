import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, output } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Item } from '@pagemaster/common/items.types';
import { PictureGalleryComponent } from 'src/app/core/gallery/picture-gallery.component';
import { ItemListPermissions } from '../item-list.component';
import { ItemsDataState } from './items-data.state';

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
    @if(pictureMode() === 'edit' && (permissions().edit || permissions().add)) {
      <app-picture-gallery [items]="pictures()" (itemSelected)="pictureMode.set('view'); selectPicture($event)"/>
      <button (click)="pictureMode.set('view')">Cancel</button>
    }
    @if(pictureMode() === 'view') {
    <div class="item-form">
      
      
        <div class="form-field">
          <img [src]="itemForm.controls.picture.value" alt="Selected Picture" width="64" height="64"/>
          @if(permissions().edit || permissions().add) {
            <button (click)="pictureMode.set('edit')">Change Picture</button>
          }
        </div>
      
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

      
      @if(permissions().edit || permissions().add) {
        <div class="form-actions">
          <button type="button" (click)="submit()">
            Submit
          </button>
        </div>
      }
      
    </div>
    }
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
      align-items: center;
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
  public permissions = input.required<ItemListPermissions>();
  public itemSubmitted = output<Item>();
  protected itemModels = inject(ItemsDataState);
  protected pictureMode = linkedSignal<'view' | 'edit'>(() => {
    return this.existingItem() ? 'view' : 'edit';
  });
  protected pictures = computed(() => {
    const modelStore = this.itemModels.itemsFile();
    const data =  modelStore.flatMap(theme => theme.models.map(model => ({ name: model.name, path: `${model.path}` })));
    return data;
  });
  protected fb = inject(FormBuilder);
  
  protected form = computed(() => {
    const existingCharacter = this.existingItem();
    const enabled = this.permissions().edit || this.permissions().add;
    return this.fb.group<ItemFormControl>({
      name: this.fb.control({value: existingCharacter?.name ?? '', disabled: !enabled}, { nonNullable: true }),
      description: this.fb.control({value: existingCharacter?.description ?? '', disabled: !enabled}, { nonNullable: true }),
      weight: this.fb.control({value: existingCharacter?.weight ?? 0, disabled: !enabled}, { nonNullable: true }),
      picture: this.fb.control({value: existingCharacter?.picture ?? '', disabled: !enabled}, { nonNullable: true }),
    });
  });

  protected selectPicture(picture: { name: string, path: string }) {

    const matchingItemModel = this.itemModels.itemsFile().flatMap(theme => theme.models).find(model => model.path === picture.path);
    if (!matchingItemModel) {
      console.warn(`Selected picture ${picture.path} does not match any item model.`);
      return;
    }
    
    this.form().controls.picture.setValue(matchingItemModel.path);
    if (this.existingItem()) {
      return;
    }

    this.form().controls.name.setValue(matchingItemModel.name);
    this.form().controls.description.setValue(matchingItemModel.description);
    const weightNumber = parseFloat(matchingItemModel.weight);
    this.form().controls.weight.setValue(isNaN(weightNumber) ? 0 : weightNumber);
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