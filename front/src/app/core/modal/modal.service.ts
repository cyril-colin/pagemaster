import { Dialog } from '@angular/cdk/dialog';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentRef, inject, Injectable, InputSignal, Type } from '@angular/core';
import { ConfirmationModalComponent, ConfirmationResult } from './confirmation-modal.component';
import { LeftPanelWrapperComponent } from './left-panel-wrapper.component';
import { ModalWrapperComponent } from './modal-wrapper.component';

export interface ModalRef<T = unknown> {
  componentRef: ComponentRef<T>,
  close: () => void | Promise<void>,
}

export type ComponentInputs<T> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [P in keyof T as T[P] extends InputSignal<any> ? P : never]: T[P] extends InputSignal<infer A> ? A : never;
};



@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private dialog = inject(Dialog);
  private overlay = inject(Overlay);
  private defaultPositionStrategy = this.overlay.position()
    .global()
    .centerHorizontally()
    .centerVertically();

  open<T>(
    component: Type<T>,
    inputs?: Partial<ComponentInputs<T>>,
  ): ModalRef<T> {
    const dialogRef = this.dialog.open<unknown, unknown, ModalWrapperComponent>(ModalWrapperComponent, {
      positionStrategy: this.defaultPositionStrategy,
    });

    const wrapperRef = dialogRef.componentRef!;
    const contentRef = wrapperRef.instance.createAndAttachContent(component, inputs || {});

    return {
      componentRef: contentRef,
      close: () => dialogRef.close(),
    };
  }

  openLeftPanel<T>(
    component: Type<T>,
    inputs?: Partial<ComponentInputs<T>>,
  ): ModalRef<T> {
    const dialogRef = this.dialog.open<unknown, unknown, LeftPanelWrapperComponent>(LeftPanelWrapperComponent, {
      positionStrategy: this.overlay.position().global(),
    });

    const wrapperRef = dialogRef.componentRef!;
    const contentRef = wrapperRef.instance.createAndAttachContent(component, inputs || {});

    // Close function with animation
    const close = async () => {
      await wrapperRef.instance.closeAnimation();
      dialogRef.close();
    };

    // Subscribe to back button events
    wrapperRef.instance.backButtonPressed.subscribe(() => {
      void close();
    });

    return { componentRef: contentRef, close };
  }

  async confirmation(message: string, title?: string): Promise<ConfirmationResult> {
    const inputs: Partial<ComponentInputs<ConfirmationModalComponent>> = { 
      message,
      ...(title && { title }),
    };

    const modalRef = this.open(ConfirmationModalComponent, inputs);

    return new Promise<ConfirmationResult>((resolve) => {
      modalRef.componentRef.instance.result.subscribe((result) => {
        void modalRef.close();
        resolve(result);
      });
    });
  }
}
