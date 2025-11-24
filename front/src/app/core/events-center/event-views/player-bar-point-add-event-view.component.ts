import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EventPlayerBarPointAdd } from '@pagemaster/common/events-player.types';
import { AbstractEventViewComponent } from './abstract-event-view.component';

@Component({
  selector: 'app-player-bar-point-add-event-view',
  standalone: true,
  template: `
    @let p = player();
    <a [routerLink]="playerUrl()"><img [src]="p?.avatar" /></a>
    gained
    <strong>{{ event().addedValue }}</strong>
    point(s)
    @let b = bar();
    @if(b) {
      in <strong>{{ b?.name }}</strong>
      ({{ b?.current }} / {{ b?.max }})
    }

  `,
  styles: [`
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;

      color: var(--color-success);
      img {
        border-radius: 50%;
        width: 32px;
        height: 32px;
      }
    }
  `],
  imports: [
    RouterModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerBarPointAddEventViewComponent extends AbstractEventViewComponent<EventPlayerBarPointAdd> {
  protected bar = computed(() => {
    const bars = this.player()?.attributes.bar || [];
    return bars.find(b => b.id === this.event().barId);
  });
}
