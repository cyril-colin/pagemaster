import { ChangeDetectionStrategy, Component, effect, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EventDiceRoll } from '@pagemaster/common/events.types';
import { AbstractEventViewComponent } from './abstract-event-view.component';


@Component({
  selector: 'app-event-dice-roll',
  template: `
    @let e = event();
    <span>Dice roll:</span>
    <span>{{displayedResult()}} / {{e.sides}}</span>
  `,
  styleUrls: ['./event-view-common.scss'],
  imports: [RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventDiceRollComponent extends AbstractEventViewComponent<EventDiceRoll> {
  readonly displayedResult = signal<number>(0);

  constructor() {
    super();
    effect(() => {
      const event = this.event();
      if (!event || typeof event.sides !== 'number' || typeof event.result !== 'number') return;
      let running = true;
      this.displayedResult.set(this.randomBetween(1, event.sides));
      const intervalId = setInterval(() => {
        if (running) {
          this.displayedResult.set(this.randomBetween(1, event.sides));
        }
      }, 80);
      setTimeout(() => {
        running = false;
        clearInterval(intervalId);
        this.displayedResult.set(event.result);
      }, 5000);
    });
  }

  private randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
