import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { ButtonComponent } from './button.component';

export type Tab = {
  label: string,
  route: string[],
  isActive: boolean,
}

@Component({
  selector: 'ds-tab',
  template: `
    <ds-button>{{ tab().label }}</ds-button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent],
})
export class TabComponent {
  public tab = input.required<Tab>();
}
@Component({
  selector: 'ds-tabs',
  imports: [TabComponent],
  template: `
    @for(t of tabs(); track t.label) {
      <ds-tab [tab]="t" (click)="tabClick.emit(t)"></ds-tab>
    }
  `,
  styles: [
    `
    :host {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;

      height: var(--tabs-height);
      width: 100%;
      gap: var(--gap-small);
      
    }
  `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsComponent {
  public tabs = input.required<Tab[]>();
  public tabClick = output<Tab>();
}




