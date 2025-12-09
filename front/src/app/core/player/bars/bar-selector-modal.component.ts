import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, output, signal } from '@angular/core';
import { AttributeBar } from '@pagemaster/common/attributes.types';
import { CurrentParticipantState } from '../../current-participant.state';
import { ButtonComponent } from '../../design-system/button.component';
import {
    ModalLayoutComponent,
    ModalLayoutFooterComponent,
    ModalLayoutHeaderComponent,
    ModalLayoutSectionComponent,
} from '../../modal/modal-layout';
import { BarViewComponent } from './bar-view.component';

@Component({
  selector: 'app-bar-selector-modal',
  template: `
    <ds-modal-layout>
      <ds-modal-layout-header [title]="isEditMode() ? 'Select Bars' : 'View Bars'">
      </ds-modal-layout-header>
      
      <ds-modal-layout-section>
        @if (availableBars().length === 0) {
          <p class="empty-message">No bars available. Create some in the quick values first.</p>
        } @else {
          <div class="bar-grid">
            @for(bar of availableBars(); track bar.id) {
              <div 
                class="bar-item"
                [class.selected]="isSelected(bar.id)"
                [class.view-only]="!isEditMode()"
                (click)="isEditMode() && toggleBar(bar)">
                <div class="bar-header">
                  <span class="bar-name">{{ bar.name }}</span>
                  @if (isSelected(bar.id)) {
                    <span class="checkmark">✓</span>
                  }
                </div>
                <app-bar-view [bar]="bar"></app-bar-view>
                <div class="bar-meta">
                  <span class="bar-range">Range: {{ bar.min }} - {{ bar.max }}</span>
                </div>
              </div>
            }
          </div>
          @if (!isEditMode()) {
            <p class="info-text">You can only view these bars. Only the Game Master can modify player bars.</p>
          }
        }
      </ds-modal-layout-section>

      <ds-modal-layout-footer>
        @if (isEditMode()) {
          <ds-button 
            [mode]="'primary'" 
            (click)="confirm()">
            Confirm {{ selectedBars().length }} Bar{{ selectedBars().length !== 1 ? 's' : '' }}
          </ds-button>
        }
      </ds-modal-layout-footer>
      
    </ds-modal-layout>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
    }

    .empty-message {
      text-align: center;
      color: var(--color-text-secondary);
      padding: var(--gap-large);
    }

    .bar-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: var(--gap-medium);
      padding: var(--gap-small);
    }

    .bar-item {
      position: relative;
      cursor: pointer;
      border: 2px solid transparent;
      border-radius: var(--border-radius);
      padding: var(--gap-small);
      transition: all 0.2s ease;
      background-color: var(--color-background-elevated);
    }

    .bar-item:hover {
      border-color: var(--color-primary);
      transform: translateY(-2px);
    }

    .bar-item.selected {
      border-color: var(--color-primary);
      background-color: var(--color-primary-alpha-10);
    }

    .bar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--gap-small);
    }

    .bar-name {
      font-weight: var(--text-weight-medium);
      font-size: var(--text-size-medium);
      color: var(--color-text-primary);
    }

    .checkmark {
      background-color: var(--color-primary);
      color: white;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
    }

    .bar-meta {
      margin-top: var(--gap-small);
      font-size: var(--text-size-small);
      color: var(--color-text-secondary);
    }

    .bar-range {
      display: block;
    }

    .bar-item.view-only {
      cursor: default;
      opacity: 0.9;
    }

    .bar-item.view-only:hover {
      border-color: transparent;
      transform: none;
    }

    .info-text {
      margin-top: var(--gap-medium);
      text-align: center;
      font-size: 0.9em;
      color: var(--color-text-secondary);
      font-style: italic;
    }
  `],
  imports: [
    CommonModule,
    ButtonComponent,
    ModalLayoutComponent,
    ModalLayoutHeaderComponent,
    ModalLayoutSectionComponent,
    ModalLayoutFooterComponent,
    BarViewComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarSelectorModalComponent implements OnInit {
  public availableBars = input.required<AttributeBar[]>();
  public alreadyAddedBarIds = input.required<string[]>();
  public barsSelected = output<AttributeBar[]>();

  private currentParticipantState = inject(CurrentParticipantState);
  
  protected isEditMode = computed(() => {
    return this.currentParticipantState.allowedToEditPlayerSnapshot();
  });

  // Writable signal for selected bar IDs
  private _selectedBarIds = signal<Set<string>>(new Set());
  
  // Computed that combines the writable signal with the initially added IDs
  protected selectedBarIds = computed(() => {
    // This will reactively update when _selectedBarIds changes
    return this._selectedBarIds();
  });

  ngOnInit(): void {
    // Initialize the writable signal with already added bar IDs
    const initialIds = this.alreadyAddedBarIds();
    this._selectedBarIds.set(new Set(initialIds));
  }

  protected isSelected(barId: string): boolean {
    return this.selectedBarIds().has(barId);
  }

  protected toggleBar(bar: AttributeBar): void {
    const current = new Set(this.selectedBarIds());
    if (current.has(bar.id)) {
      current.delete(bar.id);
    } else {
      current.add(bar.id);
    }
    this._selectedBarIds.set(current);
  }

  protected selectedBars = computed(() => {
    const selectedIds = this.selectedBarIds();
    return this.availableBars().filter(b => selectedIds.has(b.id));
  });

  protected confirm(): void {
    // Always emit, even with 0 bars (to allow removing all)
    this.barsSelected.emit(this.selectedBars());
  }
}
