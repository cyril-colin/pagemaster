import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { StrengthViewComponent } from './strength-view.component';
import { Strength } from './strengths-control.component';

@Component({
  selector: 'app-strength-list-view',
  template: `
    @for(strength of strengths(); track strength.instance.id) {
      <app-strength-view [strength]="strength"></app-strength-view>
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
  imports: [StrengthViewComponent],
})
export class StrengthListViewComponent {
  public strengths = input.required<Strength[]>();
}
