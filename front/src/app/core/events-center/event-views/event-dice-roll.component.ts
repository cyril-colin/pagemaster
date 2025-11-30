import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EventDiceRoll } from '@pagemaster/common/events.types';
import { ImageComponent } from '../../design-system/image.component';
import { PageMasterRoutes } from '../../pagemaster.router';
import { EventsCenterStateService } from '../events-center.state';
import { AbstractEventViewComponent } from './abstract-event-view.component';


@Component({
  selector: 'app-event-dice-roll',
  template: `
    @let e = event();
    @if (participant()) {
      <a [routerLink]="playerUrl()"><ds-image [src]="participant()?.avatar || ''" /></a>
    }@else {
      <span>GM</span>
    }
    <span>Run dice !</span><br />
    <div>{{displayedResult()}} / {{e.event.sides}}</div>
  `,
  styleUrls : ['./event-view-common.scss'],
  styles: [`
    :host .dice-anim {
      font-size: 1.5em;
      font-weight: bold;
      color: #e67e22;
      animation: diceBounce 0.5s infinite;
    }

    @keyframes diceBounce {
      0% { transform: scale(1); }
      50% { transform: scale(1.2); color: #f1c40f; }
      100% { transform: scale(1); }
    }
  `],
  imports: [RouterModule, ImageComponent],
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
        PageMasterRoutes().GameInstanceSession.children[3].interpolated(this.participant()?.id || ''),
      ],
    );

    return decodeURIComponent(urlTree.toString());
  }
}
