import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AttributeBar } from '@pagemaster/common/attributes.types';
import { BarViewComponent } from './bar-view.component';

@Component({
  selector: 'app-bar-list-view',
  template: `
    @for(bar of bars(); track bar.id) {
      <app-bar-view [bar]="bar"></app-bar-view>
    }
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--gap-medium);
      width: 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BarViewComponent],
})
export class BarListViewComponent {
  public bars = input.required<AttributeBar[]>();
}
