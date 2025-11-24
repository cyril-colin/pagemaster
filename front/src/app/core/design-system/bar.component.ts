import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'ds-bar',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="bar-container" [class.editable]="editable()">
      <div class="bar-visual">
        <div class="bar-fill" [style.width.%]="percentage()" [style.background-color]="color()"></div>
        <span class="bar-text">{{ value() }} / {{ max() }}</span>
        @if (editable()) {
          <div class="bar-cursor" [style.left.%]="percentage()"></div>
        }
      </div>
      @if (editable()) {
        <input 
          type="range" 
          class="bar-slider"
          [min]="min()"
          [max]="max()"
          [value]="value()"
          (input)="onSliderChange($event)"
          [attr.aria-label]="'Bar value'"
        />
      }
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      width: 100%;
    }

    .bar-container {
      position: relative;
      display: flex;
      width: 100%;
      height: 32px;
    }

    .bar-visual {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: var(--view-border);
      border-radius: var(--view-border-radius);
      overflow: hidden;
      background-color: var(--color-background-main);
      pointer-events: none;
    }

    .bar-fill {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      opacity: 0.7;
    }

    .bar-text {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--text-size-small);
      font-weight: var(--text-weight-medium);
      color: var(--text-primary);
      z-index: 2;
      text-shadow: 0 0 4px var(--color-background-main);
    }

    .bar-cursor {
      position: absolute;
      top: -2px;
      bottom: -2px;
      width: 4px;
      background-color: var(--color-primary);
      transform: translateX(-50%);
      z-index: 3;
      pointer-events: none;
      opacity: 1;
      box-shadow: 0 0 6px rgba(212, 128, 79, 0.6);
      border-radius: 2px;
    }

    /* Slider for editable mode */
    .bar-slider {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      opacity: 0;
      cursor: pointer;
      z-index: 10;
      -webkit-appearance: none;
      appearance: none;
      background: transparent;
    }

    /* Webkit slider track */
    .bar-slider::-webkit-slider-runnable-track {
      width: 100%;
      height: 100%;
      cursor: pointer;
    }

    /* Webkit slider thumb */
    .bar-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 1px;
      height: 100%;
      cursor: pointer;
    }

    /* Firefox slider track */
    .bar-slider::-moz-range-track {
      width: 100%;
      height: 100%;
      cursor: pointer;
      background: transparent;
      border: none;
    }

    /* Firefox slider thumb */
    .bar-slider::-moz-range-thumb {
      width: 1px;
      height: 100%;
      cursor: pointer;
      background: transparent;
      border: none;
    }

    /* Hover effect for editable bars */
    .bar-container.editable {
      cursor: pointer;
    }

    .bar-container.editable:hover .bar-visual {
      border-color: var(--color-primary);
    }

    .bar-container.editable:hover .bar-fill {
      opacity: 0.85;
    }

    .bar-container.editable:hover .bar-cursor {
      width: 5px;
      box-shadow: 0 0 8px rgba(212, 128, 79, 0.8);
      background-color: var(--color-primary-hover);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarComponent {
  // Inputs - use model for two-way binding support
  public value = model.required<number>();
  public color = input.required<string>();
  public editable = input<boolean>(false);
  public min = input<number>(0);
  public max = input<number>(100);

  // Outputs
  public newValue = output<{previous: number, newValue: number}>();

  // Debounce timer
  private debounceTimer: number | null = null;
  private readonly debounceTime = 300; // milliseconds

  // Internal state
  protected percentage = computed(() => {
    const val = this.value();
    const minVal = this.min();
    const maxVal = this.max();
    return ((val - minVal) / (maxVal - minVal)) * 100;
  });

  protected onSliderChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const newVal = parseInt(target.value, 10);
    const previousVal = this.value();
    
    // Update value immediately for smooth visual feedback
    this.value.set(newVal);
    
    // Debounce the output event
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
    }
    
    this.debounceTimer = window.setTimeout(() => {
      this.newValue.emit({ previous: previousVal, newValue: newVal });
      this.debounceTimer = null;
    }, this.debounceTime);
  }
}
