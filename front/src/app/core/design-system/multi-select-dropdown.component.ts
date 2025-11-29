import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

export type DSOption = { id: string, label: string, selected: boolean };

@Component({
  selector: 'ds-multi-select-dropdown',
  standalone: true,
  template: `
    <div class="ds-multi-select">
      <button type="button" class="ds-ms-toggle" (click)="toggleOpen()">
        <span class="ds-ms-label"><ng-content></ng-content></span>
        <span class="ds-ms-count">{{ selectedCount() }}</span>
      </button>

      @if(open()) {
        <div class="ds-ms-backdrop" (click)="onBackdropClick($event)"></div>
        <div class="ds-ms-dropdown">
          <div class="ds-ms-actions">
            <button type="button" class="ds-ms-action" (click)="selectAll()">All</button>
            <button type="button" class="ds-ms-action" (click)="clearAll()">Clear</button>
          </div>

          <div class="ds-ms-options">
            @for(option of items(); track option.id) {
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
      }
    </div>
  `,
  styles: [
    `
    :host { display: inline-block; position: relative; }
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

    .ds-ms-backdrop {
      position: fixed;
      inset: 0;
      background: transparent;
      z-index: var(--ds-dropdown-backdrop-z, 1000);
      /* ensure it captures clicks and prevents underlying interactions */
      pointer-events: auto;
    }

    .ds-ms-dropdown {
      position: absolute;
      z-index: var(--ds-dropdown-z, 1001);
      top: calc(100% + 6px);
      left: 0;
      min-width: 220px;
      max-height: 320px;
      overflow: auto;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      box-shadow: 0 10px 30px var(--ds-dropdown-shadow);
      border-radius: 8px;
      padding: 8px;
    }
    .ds-ms-actions { display: flex; gap: 8px; padding: 6px 4px 8px; }
    .ds-ms-action { background: transparent; border: none; color: var(--color-primary); cursor: pointer; padding: 4px 6px; }
    .ds-ms-option { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 6px; cursor: pointer; }
    .ds-ms-option:hover { background: var(--color-background-secondary); }
    .ds-ms-option-label { flex: 1; }
    .ds-ms-count { font-weight: 600; }
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

  protected open = signal(false);

  protected selectedCount = computed(() => this.localItems().filter(i => i.selected).length);

  protected toggleOpen() {
    this.open.update(v => !v);
  }

  protected onBackdropClick(event: MouseEvent) {
    // Prevent the click from propagating to underlying elements and close dropdown
    event.stopPropagation();
    this.open.set(false);
  }

  private _el = inject(ElementRef);

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent) {
    if (!this.open()) return;
    const host = this._el.nativeElement as HTMLElement;
    if (!host.contains(event.target as Node)) {
      this.open.set(false);
    }
  }

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
