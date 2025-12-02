import { ChangeDetectionStrategy, Component, input, TemplateRef, ViewChild } from '@angular/core';

@Component({
  selector: 'ds-tab',
  standalone: true,
  template: `
    <ng-template #contentTpl>
      <ng-content></ng-content>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabComponent {
  /** Title shown in the tabs navigation */
  public title = input<string>('');

  @ViewChild('contentTpl', { static: true, read: TemplateRef })
  public contentTpl!: TemplateRef<any>;
}
