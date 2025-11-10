import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AttributeBar } from '@pagemaster/common/attributes.types';
import { BarComponent } from '../../design-system/bar.component';


export type BarsPermissions = {
  edit: boolean,
};

@Component({
  selector: 'app-bars-control',
  template: `
    @for(bar of bars(); track bar.id) {
        <ds-bar 
          [value]="bar.current" 
          [color]="bar.color" 
          [editable]="permissions().edit"
          [min]="bar.min"
          [max]="bar.max"
          (newValue)="updateBarValue(bar, $event)"
        />
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
      cursor: pointer;
      padding: var(--card-padding);
      background-color: var(--color-background-secondary);
      border: var(--view-border);
      border-radius: var(--view-border-radius);
    }

    .bars-view:hover {
      background-color: var(--hover-bg);
      border-color: var(--color-border-light);
    }

    .bars-readonly {
      padding: var(--card-padding);
      background-color: var(--color-background-secondary);
      border: var(--view-border);
      border-radius: var(--view-border-radius);
    }

    .bar-edit-item {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: var(--gap-medium);
      padding: var(--gap-small);
      background-color: var(--color-background-tertiary);
      border: var(--view-border);
      border-radius: var(--view-border-radius);
      margin-bottom: var(--gap-small);
    }

    .bar-edit-item label {
      flex: 1;
      color: var(--text-primary);
      font-weight: var(--text-weight-medium);
    }

    .bar-edit-item input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }

    .bar-edit-item input[type="number"] {
      width: 80px;
      padding: var(--gap-small);
      background-color: var(--color-background-main);
      border: var(--view-border);
      border-radius: var(--view-border-radius);
      color: var(--text-primary);
      text-align: center;
    }

    button {
      padding: var(--gap-small) var(--padding-medium);
      background-color: var(--color-primary);
      color: var(--text-on-primary);
      border: none;
      border-radius: var(--view-border-radius);
      cursor: pointer;
      font-weight: var(--text-weight-medium);
    }

    button:hover {
      background-color: var(--color-primary-hover);
    }
    `,
  ],
  imports: [
    ReactiveFormsModule,
    BarComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarsControlComponent {
  public bars = input.required<AttributeBar[]>();
  public permissions = input.required<BarsPermissions>();
  public newBars = output<AttributeBar[]>();

  protected matchingBar(id: string, bars: AttributeBar[]): AttributeBar |null {
    return bars.find(b => b.id === id) || null;
  }

  protected updateBarValue(bar: AttributeBar, newValue: number): void {
    const bars = this.bars();
    const matching = this.matchingBar(bar.id, bars);

    if (matching) {
      matching.current = newValue;
      this.newBars.emit(bars);
    }
  }
  
}