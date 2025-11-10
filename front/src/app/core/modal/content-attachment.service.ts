import {
  ComponentRef,
  createComponent,
  EnvironmentInjector,
  inject,
  Injectable,
  inputBinding,
  Type,
  ViewContainerRef,
} from '@angular/core';
import { ComponentInputs } from './modal.service';

@Injectable()
export class ContentAttachmentService {
  private injector = inject(EnvironmentInjector);

  attachContent<T>(componentRef: ComponentRef<T>, container: ViewContainerRef): void {
    container.insert(componentRef.hostView);
  }

  createAndAttachContent<T>(
    component: Type<T>,
    container: ViewContainerRef,
    inputs: Partial<ComponentInputs<T>>,
  ): ComponentRef<T> {

    const bindings = Object.entries(inputs || {}).map(([key, value]) =>
      inputBinding(key, () => value),
    );

    const contentRef = createComponent(component, {
      environmentInjector: this.injector,
      bindings,
    });

    this.attachContent(contentRef, container);
    return contentRef;
  }
}
