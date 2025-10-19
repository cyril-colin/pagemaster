import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { WeaknessViewComponent } from './weakness-view.component';
import { Weakness } from './weaknesses-control.component';

@Component({
  selector: 'app-weakness-list-view',
  template: `
    @for(weakness of weaknesses(); track weakness.instance.id) {
      <app-weakness-view [weakness]="weakness"></app-weakness-view>
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
  imports: [WeaknessViewComponent],
})
export class WeaknessListViewComponent {
  public weaknesses = input.required<Weakness[]>();
}
