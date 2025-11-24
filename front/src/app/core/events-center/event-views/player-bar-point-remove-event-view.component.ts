import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EventPlayerBarPointRemove } from '@pagemaster/common/events-player.types';
import { AbstractEventViewComponent } from './abstract-event-view.component';

@Component({
  selector: 'app-player-bar-point-remove-event-view',
  standalone: true,
  template: `
    @let p = player();
    <a [routerLink]="playerUrl()"><img [src]="p?.avatar" /></a>
    lost
    <strong>{{ event().removedValue }}</strong>
    point(s)
    @let b = bar();
    @if(b) {
      in <strong>{{ b?.name }}</strong>
      ({{ b?.current }} / {{ b?.max }})
    }
    
  `,
  styleUrls: ['./event-view-common.scss'],
  styles: [`
    :host {
      color: var(--color-danger);
    }
  `],
  imports: [
    RouterModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerBarPointRemoveEventViewComponent extends AbstractEventViewComponent<EventPlayerBarPointRemove> {
  protected bar = computed(() => {
    const bars = this.player()?.attributes.bar || [];
    return bars.find(b => b.id === this.event().barId);
  });
}
