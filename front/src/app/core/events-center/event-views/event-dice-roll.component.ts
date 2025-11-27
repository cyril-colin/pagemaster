import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EventDiceRoll } from '@pagemaster/common/events.types';
import { PageMasterRoutes } from '../../pagemaster.router';
import { EventsCenterStateService } from '../events-center.state';
import { AbstractEventViewComponent } from './abstract-event-view.component';


@Component({
  selector: 'app-event-dice-roll',
  template: `
    @let e = event();
    @if (participant()) {
      <a [routerLink]="playerUrl()"><img [src]="participant()?.avatar" /></a>
    }@else {
      <span>GM</span>
    }
    <span>Run dice !</span><br />
    <div>{{displayedResult()}} / {{e.event.sides}}</div>
  `,
  styleUrls: ['./event-view-common.scss'],
  imports: [RouterModule],
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
        PageMasterRoutes().GameInstanceSession.interpolated(this.gameSession.currentGameSession().id),
        PageMasterRoutes().GameInstanceSession.children[2].interpolated(this.participant()?.id || ''),
      ],
    );

    return decodeURIComponent(urlTree.toString());
  }
}
