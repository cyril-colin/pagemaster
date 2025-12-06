import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonComponent } from '../design-system/button.component';
import { ModalLayoutComponent, ModalLayoutFooterComponent, ModalLayoutHeaderComponent, ModalLayoutSectionComponent } from './modal-layout';

export type ConfirmationResult = 'confirmed' | 'aborted';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  template: `
    <ds-modal-layout>
      <ds-modal-layout-header [title]="title()"></ds-modal-layout-header>

      <ds-modal-layout-section>
        {{ message() }}
      </ds-modal-layout-section>

      <ds-modal-layout-footer>
        <ds-button mode="secondary" (click)="result.emit('aborted')">
          Cancel
        </ds-button>
        <ds-button mode="primary-danger" (click)="result.emit('confirmed')">
          Confirm
        </ds-button>
      </ds-modal-layout-footer>
    </ds-modal-layout>

  `,
  styles: [`
     :host {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
     }
  `],
  imports: [
    ButtonComponent,
    ModalLayoutComponent,
    ModalLayoutHeaderComponent,
    ModalLayoutSectionComponent,
    ModalLayoutFooterComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationModalComponent {
  public title = input<string>('Confirmation');
  public message = input.required<string>();
  public result = output<ConfirmationResult>();
}
