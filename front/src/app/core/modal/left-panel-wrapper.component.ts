import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  ElementRef,
  HostListener,
  inject,
  output,
  Renderer2,
  viewChild,
  ViewContainerRef,
} from '@angular/core';

@Component({
  selector: 'app-left-panel-wrapper',
  template: `
    <ng-container #panelContent></ng-container>
  `,
  styles: [`
    :host {
      display: flex;
      position: fixed;
      top: 0;
      left: 0;
      width: var(--modal-left-panel-width);
      height: 100%;
      z-index: 1000;
      transform: translateX(-100%);
      transition: transform 300ms ease-in-out;
    }

    :host.open {
      transform: translateX(0);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeftPanelWrapperComponent implements AfterViewInit {

  private elementRef = inject(ElementRef<HTMLElement>);
  private renderer = inject(Renderer2);
  protected panelContent = viewChild.required('panelContent', { read: ViewContainerRef });
  
  // Output event for back button press
  backButtonPressed = output<void>();

  @HostListener('window:popstate')
  onPopState(): void {
    this.backButtonPressed.emit();
  }

  ngAfterViewInit(): void {
    // Trigger the open animation
    requestAnimationFrame(() => {
      this.renderer.addClass(this.elementRef.nativeElement, 'open');
    });

    // Push a state to history so back button can close the panel
    history.pushState({ leftPanelOpen: true }, '');
  }

  attachContent<T>(componentRef: ComponentRef<T>): void {
    this.panelContent().insert(componentRef.hostView);
  }

  closeAnimation(): Promise<void> {
    return new Promise((resolve) => {
      this.renderer.removeClass(this.elementRef.nativeElement, 'open');
      // Wait for animation to complete (300ms)
      setTimeout(resolve, 300);
    });
  }
}