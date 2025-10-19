import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Bar } from './bars-control.component';

@Component({
  selector: 'app-bar-view',
  template: `
    @let b = bar();
    <div class="bar-container">
      <div class="bar-fill" [style.width.%]="percent() * 100" [style.background-color]="b.def.color"></div>
      <span class="bar-text">{{b.instance.current}} / {{b.def.max}}</span>
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
      height: var(--view-height-medium);
      border: var(--view-border);
      border-radius: var(--view-border-radius);
      overflow: hidden;
      background: transparent;
    }
    
    .bar-fill {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      transition: width 1s ease;
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
      font-size: 12px;
      color: var(--text-primary);
      z-index: 1;
    }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
})
export class BarViewComponent {
  public bar = input.required<Bar>();
  public percent = computed(() => {
    const b = this.bar();
    return (b.instance.current / b.def.max);
  });
}