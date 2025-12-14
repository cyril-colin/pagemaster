import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { format, formatDistanceToNow } from 'date-fns';
import { CardComponent } from '../../../../../core/design-system/card.component';
import { IconComponent } from '../../../../../core/design-system/icon.component';
import { IconName } from '../../../../../core/design-system/icon.store';

@Component({
  standalone: true,
  selector: 'event-layout',
  template: `
    <ds-card [style.border-color]="borderColor()" [style.border-width.px]="5">
      <div class="layout-wrapper">
        <div class="header">
          <ng-content select="event-layout-icon"></ng-content>
          <ng-content select="event-layout-timestamp"></ng-content>
        </div>
        <div class="body">
          <ng-content select="event-layout-content"></ng-content>
          <ng-content select="event-layout-avatar"></ng-content>
        </div>
      </div>
    </ds-card>
  `,
  styles: [`
    :host {
      display: flex;
      width: 100%;
    }

    .layout-wrapper {
      display: flex;
      flex-direction: column;
      gap: var(--gap-small);
      width: 100%;
    }

    .header {
      display: flex;
      align-items: center;
      gap: var(--gap-medium);
    }

    .body {
      display: flex;
      align-items: center;
      gap: var(--event-gap);
      width: 100%;
    }
  `],
  imports: [CardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventLayoutComponent {
  public status = input<'success' | 'danger' | 'info' | 'warning'>('info');
  
  protected borderColor = computed(() => {
    const statusColors = {
      success: 'var(--event-icon-success-bg)',
      danger: 'var(--event-icon-danger-bg)',
      info: 'var(--event-icon-info-bg)',
      warning: 'var(--event-icon-warning-bg)',
    };
    return statusColors[this.status()];
  });
}

@Component({
  standalone: true,
  selector: 'event-layout-icon',
  template: `
    <div class="icon-wrapper" [class]="statusClass()">
      <ds-icon [name]="icon()" />
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .icon-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      width: var(--event-icon-size);
      height: var(--event-icon-size);
      border-radius: var(--event-icon-border-radius);
      background: var(--event-icon-background);
      color: var(--event-icon-color);
    }

    .icon-wrapper.success {
      background: var(--event-icon-success-bg);
      color: var(--event-icon-success-color);
    }

    .icon-wrapper.danger {
      background: var(--event-icon-danger-bg);
      color: var(--event-icon-danger-color);
    }

    .icon-wrapper.info {
      background: var(--event-icon-info-bg);
      color: var(--event-icon-info-color);
    }

    .icon-wrapper.warning {
      background: var(--event-icon-warning-bg);
      color: var(--event-icon-warning-color);
    }
  `],
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventLayoutIconComponent {
  public icon = input.required<IconName>();
  public status = input<'success' | 'danger' | 'info' | 'warning'>('info');
  
  protected statusClass = () => this.status();
}

@Component({
  standalone: true,
  selector: 'event-layout-content',
  template: `
    <div class="content">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--gap-small);
      flex: 1;
      min-width: 0;
      font-size: var(--event-text-size);
      color: var(--event-text-color);
    }

    .content {
      display: flex;
      align-items: center;
      gap: var(--gap-small);
      flex-wrap: wrap;
      line-height: 1.4;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventLayoutContentComponent {}

@Component({
  standalone: true,
  selector: 'event-layout-timestamp',
  template: `
    @if(timestamp()) {
      <span class="timestamp">{{ formattedTime() }}</span>
    }
  `,
  styles: [`
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .timestamp {
      font-size: var(--event-timestamp-size);
      color: var(--event-timestamp-color);
      font-style: italic;
      white-space: nowrap;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventLayoutTimestampComponent {
  public timestamp = input<number | null>(null);

  protected formattedTime = computed(() => {
    const ts = this.timestamp();
    if (!ts) return '';
    
    const date = new Date(ts);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    // Less than 1 hour: show "X minutes ago"
    if (diffInMinutes < 60) {
      return formatDistanceToNow(date, { addSuffix: true });
    }
    
    // Less than 24 hours: show "X hours ago"
    if (diffInMinutes < 1440) {
      return formatDistanceToNow(date, { addSuffix: true });
    }
    
    // More than 24 hours: show "dd/MM/yyyy HH:mm"
    return format(date, 'dd/MM/yyyy HH:mm');
  });
}

@Component({
  standalone: true,
  selector: 'event-layout-avatar',
  template: `
    <ng-content></ng-content>
  `,
  styles: [`
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventLayoutAvatarComponent {}
