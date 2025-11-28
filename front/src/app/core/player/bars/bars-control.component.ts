import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { AttributeBar } from '@pagemaster/common/attributes.types';
import { BarComponent } from '../../design-system/bar.component';
import { ButtonComponent } from '../../design-system/button.component';
import { ModalService } from '../../modal';
import { BarFormComponent } from './bar-form.component';


export type BarsPermissions = {
  edit: boolean,
  add: boolean,
  delete: boolean,
};

export type BarValueUpdateEvent = {newBar: AttributeBar, previousValue: AttributeBar};

@Component({
  selector: 'app-bars-control',
  template: `
    @if (bars().length === 0 && permissions().add) {
      <div class="bars-view">
        <span class="empty-message">No bars configured.</span>
      </div>
    }

    @for(bar of bars(); track bar.id) {
      <div class="bar-item">
        <div class="bar-content">
          <ds-bar 
            [value]="bar.current" 
            [color]="bar.color" 
            [editable]="permissions().edit"
            [min]="bar.min"
            [max]="bar.max"
            (newValue)="updateBarValue(bar, $event)"
          />
        </div>
        @if (permissions().edit || permissions().delete) {
          <div class="bar-actions">
            @if (permissions().edit) {
              <ds-button [mode]="'secondary'" [icon]="'edit'" (click)="openEditBarModal(bar)" />
            }
            @if (permissions().delete) {
              <ds-button [mode]="'primary-danger'" [icon]="'trash'" (click)="onDeleteBar(bar)" />
            }
          </div>
        }
      </div>
    }

    @if (permissions().add) {
      <ds-button [mode]="'secondary'" (click)="openNewBarModal()" [icon]="'plus'">New Bar</ds-button>
    }
  `,
  styles: [
    `
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--gap-medium);
    }

    .bars-view {
      padding: var(--card-padding);
      background-color: var(--color-background-secondary);
      border: var(--view-border);
      border-radius: var(--view-border-radius);
      min-height: 60px;
      display: flex;
      align-items: center;
    }

    .empty-message {
      color: var(--text-tertiary);
      font-style: italic;
    }

    .bar-item {
      display: flex;
      gap: var(--gap-medium);
      align-items: center;
    }

    .bar-content {
      display: flex;
      flex-direction: column;
      gap: var(--gap-small);
      flex: 1;
    }

    .bar-actions {
      display: flex;
      gap: var(--gap-small);
    }
    `,
  ],
  imports: [
    BarComponent,
    ButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarsControlComponent {
  public bars = input.required<AttributeBar[]>();
  public permissions = input.required<BarsPermissions>();
  public newBarValue = output<BarValueUpdateEvent>();
  public newBar = output<AttributeBar>();
  public editBar = output<AttributeBar>();
  public deleteBar = output<AttributeBar>();

  private modalService = inject(ModalService);

  protected updateBarValue(bar: AttributeBar, newValue: { previous: number, newValue: number }): void {
    const previousVal = bar;
    const updatedBar: AttributeBar = {
      ...bar,
      current: newValue.newValue,
    };
    this.newBarValue.emit({ newBar: updatedBar, previousValue: previousVal });
  }

  protected openNewBarModal() {
    const modalRef = this.modalService.open(BarFormComponent);
    modalRef.componentRef.instance.newBar.subscribe((bar: AttributeBar) => {
      this.newBar.emit(bar);
      void modalRef.close();
    });
  }

  protected openEditBarModal(bar: AttributeBar) {
    const modalRef = this.modalService.open(BarFormComponent, { 
      bar,
      permissions: { delete: this.permissions().delete },
    });
    modalRef.componentRef.instance.newBar.subscribe((updatedBar: AttributeBar) => {
      this.editBar.emit(updatedBar);
      void modalRef.close();
    });
    modalRef.componentRef.instance.deleteBar.subscribe((deletedBar: AttributeBar) => {
      this.deleteBar.emit(deletedBar);
      void modalRef.close();
    });
  }

  protected onDeleteBar(bar: AttributeBar) {
    this.deleteBar.emit(bar);
  }
  
}