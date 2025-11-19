import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AttributeBar } from '@pagemaster/common/attributes.types';

@Component({
  selector: 'app-bar-view',
  template: `
    @let b = bar();
    <div class="bar-container">
      <div class="bar-fill" [style.width.%]="percent() * 100" [style.background-color]="b.color"></div>
      <span class="bar-text">{{b.current}} / {{b.max}}</span>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      width: 100%;
    }
    
    .bar-container {
      position: relative;
      width: 100%;
      height: 32px;
      border: var(--view-border);
      border-radius: var(--view-border-radius);
      overflow: hidden;
      background-color: var(--color-background-main);
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
      z-index: 1;
      text-shadow: 0 0 4px var(--color-background-main);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
})
export class BarViewComponent {
  public bar = input.required<AttributeBar>();
  public percent = computed(() => {
    const b = this.bar();
    return (b.current / b.max);
  });
}