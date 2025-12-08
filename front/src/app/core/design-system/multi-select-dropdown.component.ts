import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import {
  DropdownContainerComponent,
  DropdownContentComponent,
  DropdownTriggerComponent,
} from './dropdown-container.component';

export type DSOption = { id: string, label: string, selected: boolean };

@Component({
  selector: 'ds-multi-select-dropdown',
  standalone: true,
  imports: [
    DropdownContainerComponent,
    DropdownTriggerComponent,
    DropdownContentComponent,
  ],
  template: `
    <ds-dropdown-container>
      <ds-dropdown-trigger>
        <button type="button" class="ds-ms-toggle">
          <span class="ds-ms-label"><ng-content></ng-content></span>
          <span class="ds-ms-count">{{ selectedCount() }}</span>
        </button>
      </ds-dropdown-trigger>

      <ds-dropdown-content>
        <div class="ds-ms-dropdown">
          <div class="ds-ms-actions">
            <button type="button" class="ds-ms-action" (click)="selectAll()">All</button>
            <button type="button" class="ds-ms-action" (click)="clearAll()">Clear</button>
          </div>

          <div class="ds-ms-options">
            @for(option of localItems(); track option.id) {
              <label class="ds-ms-option">
                <input
                  type="checkbox"
                  [checked]="option.selected"
                  (change)="toggleItem(option.id)"
                />
                <span class="ds-ms-option-label">{{ option.label }}</span>
              </label>
            }
          </div>
        </div>
      </ds-dropdown-content>
    </ds-dropdown-container>
  `,
  styles: [
    `
    .ds-ms-toggle {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 6px;
      border: 1px solid var(--color-border);
      background: var(--color-background-secondary);
      color: var(--text-primary);
      cursor: pointer;
    }

    .ds-ms-dropdown {
      min-width: 220px;
      max-height: 320px;
      overflow: auto;
    }

    .ds-ms-actions { display: flex; gap: 8px; padding: 6px 4px 8px; }
    .ds-ms-action { background: transparent; border: none; color: var(--color-primary); cursor: pointer; padding: 4px 6px; }
    .ds-ms-option { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 6px; cursor: pointer; }
    .ds-ms-option:hover { background: var(--color-background-secondary); }
    .ds-ms-option-label { flex: 1; }
    .ds-ms-count { font-weight: 600; }
    .ds-ms-label { color: var(--text-primary); }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiSelectDropdownComponent {
  /** Input list of options */
  public items = input<DSOption[]>([]);
  // Local writable copy synced with the input so the component updates immediately
  // when the user toggles selections (reduces round-trip dependency on parent).
  protected localItems = signal<DSOption[]>([]);

  /** Emits the updated list when selection changes */
  public selectionChange = output<DSOption[]>();

  protected selectedCount = computed(() => this.localItems().filter(i => i.selected).length);

  constructor() {
    // Keep localItems in sync with the input `items` whenever parent updates.
    effect(() => {
      this.localItems.set(this.items() ?? []);
    });
  }

  protected toggleItem(id: string) {
    const updated = this.localItems().map(i => i.id === id ? { ...i, selected: !i.selected } : i);
    this.localItems.set(updated);
    this.selectionChange.emit(updated);
  }

  protected selectAll() {
    const updated = this.localItems().map(i => ({ ...i, selected: true }));
    this.localItems.set(updated);
    this.selectionChange.emit(updated);
  }

  protected clearAll() {
    const updated = this.localItems().map(i => ({ ...i, selected: false }));
    this.localItems.set(updated);
    this.selectionChange.emit(updated);
  }
}
