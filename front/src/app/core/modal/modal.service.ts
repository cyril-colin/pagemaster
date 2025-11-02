import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ApplicationRef, ComponentRef, createComponent, EnvironmentInjector, inject, Injectable, Type } from '@angular/core';
import { take, tap } from 'rxjs';
import { ConfirmationModalComponent, ConfirmationResult } from './confirmation-modal.component';
import { ModalWrapperComponent } from './modal-wrapper.component';

export interface ModalConfig {
  hasBackdrop?: boolean,
  backdropClass?: string,
  panelClass?: string,
  disableClose?: boolean,
}

export interface ModalRef<T = unknown> {
  componentRef: ComponentRef<T>,
  close: () => void,
}

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private overlay = inject(Overlay);
  private appRef = inject(ApplicationRef);
  private injector = inject(EnvironmentInjector);

  open<T>(
    component: Type<T>,
    inputs?: Record<string, unknown>,
    config?: ModalConfig,
  ): ModalRef<T> {
    // Create overlay
    const overlayRef = this.overlay.create({
      hasBackdrop: config?.hasBackdrop ?? true,
      backdropClass: config?.backdropClass ?? 'cdk-overlay-dark-backdrop',
      panelClass: config?.panelClass,
      positionStrategy: this.overlay.position()
        .global()
        .centerHorizontally()
        .centerVertically(),
      scrollStrategy: this.overlay.scrollStrategies.block(),
    });

    // Create the wrapper component
    const wrapperPortal = new ComponentPortal(ModalWrapperComponent);
    const wrapperRef = overlayRef.attach(wrapperPortal);

    // Create the content component
    const contentRef = createComponent(component, {
      environmentInjector: this.injector,
      elementInjector: wrapperRef.injector,
    });

    // Set inputs if provided
    if (inputs) {
      Object.keys(inputs).forEach((key) => {
        contentRef.setInput(key, inputs[key]);
      });
    }

    // Attach the content component to the wrapper
    wrapperRef.instance.attachContent(contentRef);


    // Close function
    const close = () => {
      this.appRef.detachView(contentRef.hostView);
      contentRef.destroy();
      overlayRef.dispose();
    };

    // Handle backdrop click
    if (config?.disableClose !== true) {
      overlayRef.backdropClick().pipe(
        take(1),
        tap(() => close()),
      ).subscribe();
    }

    return {
      componentRef: contentRef,
      close,
    };
  }

  async confirmation(message: string, title?: string): Promise<ConfirmationResult> {
    const inputs: Record<string, unknown> = { message };
    if (title) {
      inputs['title'] = title;
    }
    
    const modalRef = this.open(ConfirmationModalComponent, inputs, { disableClose: true });
    
    return new Promise<ConfirmationResult>((resolve) => {
      modalRef.componentRef.instance.result.subscribe((result) => {
        modalRef.close();
        resolve(result);
      });
    });
  }
}
