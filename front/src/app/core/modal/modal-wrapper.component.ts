import { ChangeDetectionStrategy, Component, ComponentRef, viewChild, ViewContainerRef } from '@angular/core';

@Component({
  selector: 'app-modal-wrapper',
  template: `
    <ng-container class="modal-content" #modalContent></ng-container>
  `,
  styles: [`
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 350px;
      min-height: 200px;
      background: var(--color-modal-background);
      border-radius: var(--view-border-radius);
      padding: var(--padding-large);
      overflow: scroll;
    }

    .modal-content {
      width: 100%;
      height: 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalWrapperComponent {

  protected modalContent = viewChild.required('modalContent', { read: ViewContainerRef });

  attachContent<T>(componentRef: ComponentRef<T>): void {
    this.modalContent().insert(componentRef.hostView);
  }
}
