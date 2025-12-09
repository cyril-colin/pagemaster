import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, output, signal } from '@angular/core';
import { AttributeStatus } from '@pagemaster/common/attributes.types';
import { CurrentParticipantState } from '../../current-participant.state';
import { ButtonComponent } from '../../design-system/button.component';
import {
  ModalLayoutComponent,
  ModalLayoutFooterComponent,
  ModalLayoutHeaderComponent,
  ModalLayoutSectionComponent,
} from '../../modal/modal-layout';
import { StatusViewComponent } from './status-view.component';

@Component({
  selector: 'app-status-selector-modal',
  template: `
    <ds-modal-layout>
      <ds-modal-layout-header [title]="isEditMode() ? 'Select Statuses' : 'View Statuses'">
      </ds-modal-layout-header>
      
      <ds-modal-layout-section>
        @if (availableStatuses().length === 0) {
          <p class="empty-message">No statuses available. Create some in the quick values first.</p>
        } @else {
          <div class="status-grid">
            @for(status of availableStatuses(); track status.id) {
              <div 
                class="status-item"
                [class.selected]="isSelected(status.id)"
                [class.view-only]="!isEditMode()"
                (click)="isEditMode() && toggleStatus(status)">
                <app-status-view [status]="status"></app-status-view>
                @if (isSelected(status.id)) {
                  <span class="checkmark">✓</span>
                }
              </div>
            }
          </div>
          @if (!isEditMode()) {
            <p class="info-text">You can only view these statuses. Only the Game Master can modify player statuses.</p>
          }
        }
      </ds-modal-layout-section>

      <ds-modal-layout-footer>
        @if (isEditMode()) {
          <ds-button 
            [mode]="'primary'" 
            (click)="confirm()">
            Confirm {{ selectedStatuses().length }} Status{{ selectedStatuses().length !== 1 ? 'es' : '' }}
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

    .status-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: var(--gap-medium);
      padding: var(--gap-small);
    }

    .status-item {
      position: relative;
      cursor: pointer;
      border: 2px solid transparent;
      border-radius: var(--border-radius);
      padding: var(--gap-small);
      transition: all 0.2s ease;
    }

    .status-item:hover {
      border-color: var(--color-primary);
      transform: translateY(-2px);
    }

    .status-item.selected {
      border-color: var(--color-primary);
      background-color: var(--color-primary-alpha-10);
    }

    .checkmark {
      position: absolute;
      top: 4px;
      right: 4px;
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

    .status-item.view-only {
      cursor: default;
      opacity: 0.9;
    }

    .status-item.view-only:hover {
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
    StatusViewComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusSelectorModalComponent implements OnInit {
  public availableStatuses = input.required<AttributeStatus[]>();
  public alreadyAddedStatusIds = input.required<string[]>();
  public statusesSelected = output<AttributeStatus[]>();

  private currentParticipantState = inject(CurrentParticipantState);
  
  protected isEditMode = computed(() => {
    return this.currentParticipantState.allowedToEditPlayerSnapshot();
  });

  // Writable signal for selected status IDs
  private _selectedStatusIds = signal<Set<string>>(new Set());
  
  // Computed that combines the writable signal with the initially added IDs
  protected selectedStatusIds = computed(() => {
    // This will reactively update when _selectedStatusIds changes
    return this._selectedStatusIds();
  });

  ngOnInit(): void {
    // Initialize the writable signal with already added status IDs
    const initialIds = this.alreadyAddedStatusIds();
    this._selectedStatusIds.set(new Set(initialIds));
  }

  protected isSelected(statusId: string): boolean {
    return this.selectedStatusIds().has(statusId);
  }

  protected toggleStatus(status: AttributeStatus): void {
    const current = new Set(this.selectedStatusIds());
    if (current.has(status.id)) {
      current.delete(status.id);
    } else {
      current.add(status.id);
    }
    this._selectedStatusIds.set(current);
  }

  protected selectedStatuses = computed(() => {
    const selectedIds = this.selectedStatusIds();
    return this.availableStatuses().filter(s => selectedIds.has(s.id));
  });

  protected confirm(): void {
    // Always emit, even with 0 statuses (to allow removing all)
    this.statusesSelected.emit(this.selectedStatuses());
  }
}
