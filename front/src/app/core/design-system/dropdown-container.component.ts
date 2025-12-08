import { OverlayModule } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

@Component({
  selector: 'ds-dropdown-container',
  standalone: true,
  imports: [OverlayModule],
  template: `
    <div class="ds-dropdown-wrapper" cdkOverlayOrigin #trigger="cdkOverlayOrigin">
      <!-- Trigger slot -->
      <div class="ds-dropdown-trigger" (click)="toggleOpen()">
        <ng-content select="ds-dropdown-trigger"></ng-content>
      </div>
    </div>

    <!-- CDK Overlay -->
    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="trigger"
      [cdkConnectedOverlayOpen]="open()"
      [cdkConnectedOverlayHasBackdrop]="true"
      [cdkConnectedOverlayBackdropClass]="'ds-dropdown-backdrop'"
      (backdropClick)="closeDropdown()"
      (detach)="closeDropdown()"
      [cdkConnectedOverlayPositions]="overlayPositions"
      [cdkConnectedOverlayPanelClass]="'ds-dropdown-panel'"
    >
      <div class="ds-dropdown-content">
        <!-- Content slot -->
        <ng-content select="ds-dropdown-content"></ng-content>
      </div>
    </ng-template>
  `,
  styles: [
    `
    :host {
      display: inline-block;
      position: relative;
    }

    .ds-dropdown-wrapper {
      position: relative;
    }

    .ds-dropdown-trigger {
      display: inline-block;
      cursor: pointer;
    }

    ::ng-deep .ds-dropdown-backdrop {
      background: transparent;
    }

    .ds-dropdown-content {
      background: var(--color-background-tertiary, #2f3840);
      border: 2px solid var(--color-border-light, #4a5560);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 8px;
      min-width: 150px;
      max-height: 400px;
      overflow-y: auto;
    }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownContainerComponent {
  /** Control whether the dropdown is initially open */
  public isOpen = input<boolean>(false);

  /** Emits when dropdown opens or closes */
  public openChange = output<boolean>();

  /** Internal open state */
  protected open = signal(false);

  private _el = inject(ElementRef);

  /** CDK Overlay positions - try below first, then above, then sides */
  protected overlayPositions = [
    {
      originX: 'start' as const,
      originY: 'bottom' as const,
      overlayX: 'start' as const,
      overlayY: 'top' as const,
      offsetY: 6,
    },
    {
      originX: 'start' as const,
      originY: 'top' as const,
      overlayX: 'start' as const,
      overlayY: 'bottom' as const,
      offsetY: -6,
    },
    {
      originX: 'end' as const,
      originY: 'bottom' as const,
      overlayX: 'end' as const,
      overlayY: 'top' as const,
      offsetY: 6,
    },
    {
      originX: 'end' as const,
      originY: 'top' as const,
      overlayX: 'end' as const,
      overlayY: 'bottom' as const,
      offsetY: -6,
    },
  ];

  constructor() {
    // Sync with input if provided
    this.open.set(this.isOpen());
  }

  protected toggleOpen() {
    const newState = !this.open();
    this.open.set(newState);
    this.openChange.emit(newState);
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent) {
    if (!this.open()) return;
    const host = this._el.nativeElement as HTMLElement;
    if (!host.contains(event.target as Node)) {
      this.closeDropdown();
    }
  }

  protected closeDropdown() {
    this.open.set(false);
    this.openChange.emit(false);
  }

  /** Public method to programmatically close the dropdown */
  public close() {
    this.closeDropdown();
  }
}

// Projection components for cleaner API
@Component({
  selector: 'ds-dropdown-trigger',
  standalone: true,
  template: '<ng-content></ng-content>',
  styles: [`
    :host {
      display: contents;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownTriggerComponent {}

@Component({
  selector: 'ds-dropdown-content',
  standalone: true,
  template: '<ng-content></ng-content>',
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownContentComponent {}
