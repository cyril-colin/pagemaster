import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { ButtonComponent } from '../design-system/button.component';

@Component({
  standalone: true,
  selector: 'ds-modal-layout',
  template: `
  <ng-content select="ds-modal-layout-header"></ng-content>
  <ng-content select="ds-modal-layout-section"></ng-content>
  <ng-content select="ds-modal-layout-footer"></ng-content>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: space-between;
      width: 100%;
      height: 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalLayoutComponent {}

@Component({
  standalone: true,
  selector: 'ds-modal-layout-header',
  template: `
    <div class="head">
      <span class="title">{{ title() }}</span>
      <ng-content></ng-content>
    </div>
    
    <ds-button [mode]="'mini'" [icon]="'close'" (click)="dialogRef.close()"/>
  `,
  styles: [`
    :host {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: var(--gap-medium);
      border-bottom: 1px solid var(--color-border);
      .head {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: var(--gap-medium);
      }
      .title {
        font-size: var(--text-size-large);
        font-weight: var(--text-weight-bold);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent],
})
export class ModalLayoutHeaderComponent {
  protected dialogRef = inject(DialogRef);
  public title = input<string>('');
}

@Component({
  standalone: true,
  selector: 'ds-modal-layout-section',
  template: `
  <ng-content></ng-content>
  `,
  styles: [`
    :host {
      display: block;
      flex: 1;
      padding: var(--gap-medium);
      overflow-y: auto;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalLayoutSectionComponent {}



@Component({
  standalone: true,
  selector: 'ds-modal-layout-footer',
  template: `
    <ng-content></ng-content>
  `,
  styles: [`
    :host {
      display: block;
      padding: var(--gap-medium);
      border-top: 1px solid var(--color-border);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class ModalLayoutFooterComponent {
}