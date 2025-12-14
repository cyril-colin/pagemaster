import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EventDiceRoll } from '@pagemaster/common/events.types';
import { SmartRoutes } from 'src/app/app.routes';
import { ImageComponent } from '../../../../../core/design-system/image.component';
import { EventsCenterStateService } from '../../../../../core/events-center/events-center.state';
import { AbstractEventViewComponent } from './abstract-event-view.component';
import {
  EventLayoutAvatarComponent,
  EventLayoutComponent,
  EventLayoutContentComponent,
  EventLayoutIconComponent,
  EventLayoutTimestampComponent,
} from './event-layout.component';


@Component({
  selector: 'app-event-dice-roll',
  template: `
    @let e = event();
    @let p = participant();
    <event-layout [status]="'danger'">
      <event-layout-icon [icon]="'dice-6'" [status]="'danger'" />
      <event-layout-timestamp [timestamp]="e.event.timestamp" />
      <event-layout-content>
        <span>
          @if (p) {
            <strong>{{p.name}}</strong>
          } @else {
            <strong>GM</strong>
          }
          rolled dice:
        </span>
        <strong [class.dice-anim]="e.isNew">{{displayedResult()}}</strong>
        <span>/ {{e.event.sides}}</span>
      </event-layout-content>
      @if (p) {
        <event-layout-avatar>
          <a [routerLink]="playerUrl()"><ds-image [size]="'m'" [src]="p.avatar || ''" /></a>
        </event-layout-avatar>
      }
    </event-layout>
  `,
  styleUrls : ['./event-view-common.scss'],
  styles: [`
    .dice-anim {
      color: var(--color-warning);
      animation: dicePulse 0.4s ease-in-out infinite;
    }

    @keyframes dicePulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
  `],
  imports: [RouterModule,
    ImageComponent,
    EventLayoutComponent,
    EventLayoutIconComponent,
    EventLayoutContentComponent,
    EventLayoutAvatarComponent,
    EventLayoutTimestampComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventDiceRollComponent extends AbstractEventViewComponent<EventDiceRoll> {
  readonly displayedResult = signal<number>(0);
  protected participant = computed(() => {
    if (this.event().event.triggeringPlayerId === null) {
      return null;
    }
    return this.gameSession.currentGameSession().players.find(p => p.id === this.event().event.triggeringPlayerId);
  });

  protected eventState = inject(EventsCenterStateService);

  constructor() {
    super();
    effect(() => {
      const event = this.event();
      if (!event.isNew) {
        this.displayedResult.set(event.event.result);
        return;
      }
      
      let running = true;
      this.displayedResult.set(this.randomBetween(1, event.event.sides));
      const intervalId = setInterval(() => {
        if (running) {
          this.displayedResult.set(this.randomBetween(1, event.event.sides));
        }
      }, 80);
      setTimeout(() => {
        running = false;
        clearInterval(intervalId);
        this.displayedResult.set(event.event.result);
        this.eventState.setSeen([event.event.id]);
      }, 3000);
    });
  }

  private randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  protected router = inject(Router);
  protected route = inject(ActivatedRoute);

  protected playerUrl() {
    const urlTree = this.router.createUrlTree(
      [
        '',
        ...SmartRoutes.gameInstanceSession.path(this.gameSession.currentGameSession().id),
        ...SmartRoutes.gameInstanceSession.children.playerLayout.path(this.participant()?.id || ''),
      ],
    );

    return decodeURIComponent(urlTree.toString());
  }
}
