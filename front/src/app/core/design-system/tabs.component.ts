import { CommonModule } from '@angular/common';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  ContentChildren,
  QueryList,
  signal,
} from '@angular/core';
import { TabComponent } from './tab.component';

@Component({
  selector: 'ds-tabs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ds-tabs">
      <div class="ds-tabs__nav">
        <button
          class="ds-tabs__nav-item"
          *ngFor="let t of tabsList(); let i = index"
          [class.active]="selectedIndex() === i"
          (click)="select(i)"
        >
          {{ t.title() }}
        </button>
      </div>

      <div class="ds-tabs__content">
        <ng-container *ngIf="selectedTab() as activeTab">
          <ng-container [ngTemplateOutlet]="activeTab.contentTpl"></ng-container>
        </ng-container>
      </div>

      <ng-content select="ds-tab" style="display:none"></ng-content>
    </div>
  `,
  styles: [
    `
    .ds-tabs {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .ds-tabs__nav {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .ds-tabs__nav-item {
      background: transparent;
      border: none;
      padding: 8px 12px;
      border-radius: 6px;
      cursor: pointer;
      font: inherit;
      color: var(--text-primary);
      transition: background 0.12s;
    }

    .ds-tabs__nav-item:hover {
      background: var(--color-background-secondary);
    }

    .ds-tabs__nav-item.active {
      background: var(--color-primary);
      color: var(--text-on-primary);
    }

    .ds-tabs__content {
      display: block;
    }
  `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsComponent implements AfterContentInit {
  @ContentChildren(TabComponent)
  protected tabsQuery!: QueryList<TabComponent>;

  protected tabsList = signal<TabComponent[]>([]);
  protected selectedIndex = signal(0);

  protected selectedTab = computed(() => {
    const tabs = this.tabsList();
    return tabs && tabs.length > 0 ? tabs[this.selectedIndex()] : null;
  });

  ngAfterContentInit(): void {
    this.updateTabsList();
    this.tabsQuery.changes.subscribe(() => this.updateTabsList());
  }

  protected select(index: number): void {
    this.selectedIndex.set(index);
  }

  private updateTabsList(): void {
    this.tabsList.set(this.tabsQuery.toArray());
    // ensure selectedIndex within bounds
    const tabs = this.tabsList();
    if (tabs.length === 0) this.selectedIndex.set(0);
    else if (this.selectedIndex() >= tabs.length) this.selectedIndex.set(0);
  }
}
