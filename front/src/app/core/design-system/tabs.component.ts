import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';

export type Tab = {
  label: string,
  route: string[],
  isActive: boolean,
}

@Component({
  selector: 'ds-tab',
  template: `
    <button 
      class="tab-button" 
      [class.active]="tab().isActive"
      type="button">
      {{ tab().label }}
    </button>
  `,
  styles: [`
    .tab-button {
      position: relative;
      padding: var(--tab-padding);
      background: transparent;
      border: none;
      border-bottom: var(--tab-border-width) solid var(--tab-inactive-border-color);
      color: var(--text-secondary);
      font-size: var(--text-size-medium);
      font-weight: var(--text-weight-medium);
      cursor: pointer;
      transition: all var(--transition-speed) ease;
      white-space: nowrap;
      height: 100%;
      
      &:hover {
        color: var(--text-primary);
        background: var(--color-background-tertiary);
      }
      
      &.active {
        color: var(--color-primary);
        border-bottom-color: var(--tab-active-border-color);
        background: var(--color-background-tertiary);
      }
      
      &:focus-visible {
        outline: 2px solid var(--color-primary);
        outline-offset: -2px;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabComponent {
  public tab = input.required<Tab>();
}

@Component({
  selector: 'ds-tabs',
  imports: [TabComponent],
  template: `
    <div class="tabs-wrapper">
      <div class="tabs-container">
        @for(t of scrollableTabs(); track t.label) {
          <ds-tab [tab]="t" (click)="tabClick.emit(t)"></ds-tab>
        }
      </div>
      @if(fixedLastTab() && lastTab()) {
        <div class="fixed-tab">
          <ds-tab [tab]="lastTab()!" (click)="tabClick.emit(lastTab()!)"></ds-tab>
        </div>
      }
    </div>
    <div class="tabs-border"></div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: var(--tabs-height);
    }
    
    .tabs-wrapper {
      display: flex;
      flex-direction: row;
      height: 100%;
      background: var(--color-background-secondary);
    }
    
    .tabs-container {
      display: flex;
      flex-direction: row;
      align-items: stretch;
      justify-content: flex-start;
      gap: var(--gap-small);
      height: 100%;
      flex: 1;
      overflow-x: auto;
      overflow-y: hidden;
      
      /* Hide scrollbar for Chrome, Safari and Opera */
      &::-webkit-scrollbar {
        display: none;
      }
      
      /* Hide scrollbar for IE, Edge and Firefox */
      -ms-overflow-style: none;  /* IE and Edge */
      scrollbar-width: none;  /* Firefox */
      
      /* Smooth scrolling */
      scroll-behavior: smooth;
    }
    
    .fixed-tab {
      display: flex;
      flex-shrink: 0;
      border-left: 1px solid var(--color-border);
      box-shadow: -4px 0 8px -2px rgba(0, 0, 0, 0.3);
      position: relative;
    }
    
    .tabs-border {
      height: var(--tab-border-width);
      background: var(--color-border);
      width: 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsComponent {
  public tabs = input.required<Tab[]>();
  public fixedLastTab = input<boolean>(false);
  public tabClick = output<Tab>();

  protected scrollableTabs = computed(() => {
    const allTabs = this.tabs();
    return this.fixedLastTab() && allTabs.length > 0
      ? allTabs.slice(0, -1)
      : allTabs;
  });

  protected lastTab = computed(() => {
    const allTabs = this.tabs();
    return this.fixedLastTab() && allTabs.length > 0
      ? allTabs[allTabs.length - 1]
      : null;
  });
}




