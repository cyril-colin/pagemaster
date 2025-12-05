import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentRef, createEnvironmentInjector, EnvironmentInjector, inject, Injectable, InputSignal, Type } from '@angular/core';
import { ConfirmationModalComponent, ConfirmationResult } from './confirmation-modal.component';
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
  private environmentInjector = inject(EnvironmentInjector);
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
      width: 'var(--ds-modal-width)',
      height: 'var(--ds-modal-height)',
    });

    const wrapperRef = dialogRef.componentRef!;
    
    // Create an injector that provides the DialogRef
    const contentInjector = createEnvironmentInjector(
      [
        { provide: DialogRef, useValue: dialogRef },
      ],
      this.environmentInjector,
    );
    
    const contentRef = wrapperRef.instance.createAndAttachContent(component, inputs || {}, contentInjector);

    return {
      componentRef: contentRef,
      close: () => dialogRef.close(),
    };
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
