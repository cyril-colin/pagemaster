import { ChangeDetectionStrategy, Component, computed, effect, inject, input, linkedSignal, output, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Attributes } from '@pagemaster/common/attributes.types';
import { ItemInstance } from '@pagemaster/common/items.types';
import { Character } from '@pagemaster/common/pagemaster.types';
import { ModalService } from '../../modal';
import { InventoryListViewComponent } from './inventory-list-view.component';

export type Inventory = {
  def: Attributes['inventory']['definition'],
  instance: Attributes['inventory']['instance'],
  selected: boolean,
};

type InventoryItem = { id: string };
type InventoryForm = FormGroup<{
  id: FormControl<string>,
  current: FormArray<FormControl<InventoryItem>>,
  selected: FormControl<boolean>,
}>;

@Component({
  selector: 'app-inventories-control',
  template: `
    @if (mode() === 'view') {
      <div (click)="edit()" class="inventory-views">
        @let selection = selectedInventories();
        @if (selection.length === 0) {
          <span>No inventories selected. Click to edit.</span>
        } @else {
          <app-inventory-list-view [inventories]="selection" [character]="character()"></app-inventory-list-view>
        }
      </div>
    } @else {
      @for(inventory of inventories(); track inventory.instance.id; let i = $index) {
        <div>
          <input type="checkbox" [formControl]="form.controls.inventoryForms.controls[i].controls.selected" />
          <label>{{ inventory.def.name }}</label>
          <div>
            <label>Items:</label>
            @for(itemCtrl of form.controls.inventoryForms.controls[i].controls.current.controls; track itemCtrl.value.id; let j = $index) {
              <div>
                <input type="text" [value]="itemCtrl.value.id" (input)="updateItemId(i, j, $event.target.value)" />
                <button type="button" (click)="removeItem(i, j)">Remove</button>
              </div>
            }
            <button type="button" (click)="addItem(i)">Add Item</button>
          </div>
        </div>
      }
      <button (click)="submit()">Save</button>
    }
  `,
  styles: [`
    .inventory-views {
      display: flex;
      flex-direction: column;
      gap: var(--gap-medium);
      cursor: pointer;
      align-items: center;
    }
  `],
  imports: [
    ReactiveFormsModule,
    InventoryListViewComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoriesControlComponent {
  public character = input.required<Character>();
  public inventories = input.required<Inventory[]>();
  protected inventoriesState = linkedSignal(this.inventories);
  protected selectedInventories = computed(() => this.inventoriesState().filter(inventory => inventory.selected));
  public newInventories = output<Inventory[]>();

  protected fb = inject(FormBuilder);
  protected form = this.fb.group<{inventoryForms: FormArray<InventoryForm>}>({
    inventoryForms: this.fb.array<InventoryForm>([]),
  });

  protected mode = signal<'view' | 'edit'>('view');

  protected modalService = inject(ModalService);
  protected edit() {

  }
  constructor() {
    effect(() => {
      this.form.controls.inventoryForms.clear();
      this.inventories().forEach((inventory) => {
        const itemsArray = this.fb.array<FormControl<ItemInstance>>(
          (inventory.instance.current || []).map(item => this.fb.control(item, {nonNullable: true})),
        );
        const formGroup = this.fb.group({
          id: this.fb.control(inventory.instance.id, {nonNullable: true}),
          current: itemsArray,
          selected: this.fb.control(inventory.selected, {nonNullable: true}),
        });
        this.form.controls.inventoryForms.push(formGroup);
      });
    });
  }

  protected addItem(inventoryIdx: number): void {
    const inventoryForm = this.form.controls.inventoryForms.at(inventoryIdx);
    inventoryForm.controls.current.push(this.fb.control({id: ''}, {nonNullable: true}));
  }

  protected removeItem(inventoryIdx: number, itemIdx: number): void {
    const inventoryForm = this.form.controls.inventoryForms.at(inventoryIdx);
    inventoryForm.controls.current.removeAt(itemIdx);
  }

  protected updateItemId(inventoryIdx: number, itemIdx: number, newId: string): void {
    const inventoryForm = this.form.controls.inventoryForms.at(inventoryIdx);
    const itemCtrl = inventoryForm.controls.current.at(itemIdx);
    itemCtrl.setValue({id: newId});
  }

  protected setMode(newMode: 'view' | 'edit'): void {
    this.mode.set(newMode);
  }

  protected matchingInventory(id: string): Inventory | null {
    return this.inventories().find(inv => inv.instance.id === id) || null;
  }

  protected submit(): void {
    this.setMode('view');
    const data = this.form.controls.inventoryForms.controls.map(formGroup => {
      const matching = this.matchingInventory(formGroup.controls.id.value);
      return {
        def: matching ? matching.def : ({} as Attributes['inventory']['definition']),
        instance: {
          id: formGroup.controls.id.value,
          current: formGroup.controls.current.controls.map(ctrl => ctrl.value),
        },
        selected: formGroup.controls.selected.value,
      };
    });
    this.inventoriesState.set(data);
    this.newInventories.emit(data);
  }
}
