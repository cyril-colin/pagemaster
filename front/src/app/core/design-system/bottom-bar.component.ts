import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'ds-bottom-bar',
  standalone: true,
  template: `
    <div class="ds-bottom-bar">
      <button class="ds-bottom-bar__icon-btn" (click)="history.emit()" style="position:relative;">
        <div class="ds-bottom-bar__icon">📜
          @if (eventCount() > 0) {
            <span class="ds-bottom-bar__badge">{{ eventCount() }}</span>
          }
        </div>
        <span class="ds-bottom-bar__title">History</span>
      </button>
      <button class="ds-bottom-bar__icon-btn" (click)="session.emit()">
        <div class="ds-bottom-bar__icon">👥</div>
        <span class="ds-bottom-bar__title">Session</span>
      </button>
      <button class="ds-bottom-bar__quick-action" (click)="quickAction.emit()">
        ⚡
      </button>
      <button class="ds-bottom-bar__icon-btn" (click)="me.emit()">
        <div class="ds-bottom-bar__icon">🧑</div>
        <span class="ds-bottom-bar__title">Me</span>
      </button>
      <button class="ds-bottom-bar__icon-btn" (click)="notes.emit()">
        <div class="ds-bottom-bar__icon">📝</div>
        <span class="ds-bottom-bar__title">Notes</span>
      </button>
    </div>
  `,
  styles: [`
    .ds-bottom-bar {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      padding: var(--ds-bottom-bar-padding, 0.75rem);
      background: var(--ds-bottom-bar-bg, #222);
      box-shadow: 0 -2px 8px rgba(0,0,0,0.08);
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 100;
      height: var(--footer-height);
    }
    .ds-bottom-bar__icon-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      background: none;
      border: none;
      color: var(--ds-bottom-bar-fg, #fff);
      cursor: pointer;
      font: inherit;
      padding: 0 0.5rem;
      border-radius: var(--ds-bottom-bar-radius, 6px);
      transition: background 0.2s;
      min-width: 60px;
    }
    .ds-bottom-bar__icon-btn:hover {
      background: var(--ds-bottom-bar-hover, #333);
    }
    .ds-bottom-bar__icon {
      font-size: 2em;
      line-height: 1;
      margin-bottom: 0.25em;
    }
    .ds-bottom-bar__title {
      font-size: 0.95em;
      margin-top: 0.1em;
    }
    .ds-bottom-bar__quick-action {
      position: absolute;
      left: 50%;
      transform: translateX(-50%) translateY(-40%);
      top: 0;
      background: var(--ds-bottom-bar-quick-bg, #2196f3);
      color: #fff;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4em;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.12);
      transition: background 0.2s;
      z-index: 101;
      text-align: center;
      padding: 0;
    }
    .ds-bottom-bar__quick-action:hover {
      background: var(--ds-bottom-bar-quick-bg-hover, #1976d2);
    }
    .ds-bottom-bar__badge {
      position: absolute;
      top: -6px;
      right: -10px;
      min-width: 18px;
      height: 18px;
      background: #e53935;
      color: #fff;
      border-radius: 50%;
      font-size: 0.5em;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      z-index: 2;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BottomBarComponent {
  eventCount = input<number>(0);
  history = output<void>();
  session = output<void>();
  me = output<void>();
  notes = output<void>();
  quickAction = output<void>();
}
