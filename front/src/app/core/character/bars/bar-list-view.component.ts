import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { BarViewComponent } from './bar-view.component';
import { Bar } from './bars-control.component';

@Component({
  selector: 'app-bar-list-view',
  template: `
    @for(bar of selected(); track bar.instance.id) {
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
  public bars = input.required<Bar[]>();
  protected selected = computed(() => this.bars().filter(b => b.selected));
}
