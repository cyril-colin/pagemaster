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
      width: 100%;
      max-width: 500px;
      min-height: 200px;
      background-color: var(--color-background-secondary);
      border: 2px solid var(--color-border);
      border-radius: var(--view-border-radius);
      padding: var(--padding-large);
      overflow-y: auto;
      box-shadow: 0 4px 24px var(--color-shadow-heavy);
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
