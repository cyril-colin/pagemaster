import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { EventDiceRoll } from '@pagemaster/common/events.types';
import { CurrentGameSessionState } from 'src/app/core/current-game-session.state';
import { CurrentParticipantState } from 'src/app/core/current-participant.state';
import { ButtonComponent } from 'src/app/core/design-system/button.component';
import { EventDiceRollComponent } from 'src/app/core/events-center/event-views/event-dice-roll.component';
import { EventMeta, EventsCenterStateService } from 'src/app/core/events-center/events-center.state';
import { ModalService } from 'src/app/core/modal';
import { PageMasterRoutes } from 'src/app/core/pagemaster.router';
import { GameEventRepository } from 'src/app/core/repositories/game-event.repository';
import { MainMenuComponent } from './main-menu.component';

@Component({
  selector: 'app-game-session',
  template: `
  <section class="header">
    <div class="links">
      <ds-button [icon]="'menu'" (click)="openMainMenu()"/>
      <ds-button (click)="runDice(6)">d6</ds-button>
      <ds-button (click)="runDice(20)">d20</ds-button>
      @let e = lastRunningDiceEvent();
      @if (e) {
          <app-event-dice-roll [event]="e"></app-event-dice-roll>
        }
      <ds-button (click)="goToEvents()" [mode]="'secondary'" [icon]="'bell'">
        ({{ eventCount() }})
      </ds-button>
    </div>
  </section>

  <section class="main-content">
    <router-outlet />
  </section>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      padding-top: var(--header-height);
    }

    .header {
      position: fixed;
      z-index: 100;
      top: 0;
      left: 0;
      right: 0;
      width: 100%;
      height: var(--header-height);
      background-color: var(--color-background-secondary);
      border-bottom: var(--view-border);
      display: flex;
      flex-direction: column;
      box-shadow: 0 2px 8px var(--color-shadow-heavy);
    }

    .links {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      padding: var(--padding-medium);
      gap: var(--gap-medium);
      border-bottom: 1px solid var(--color-border-heavy);

      a {
        display: flex;
        align-items: center;
        padding: var(--gap-small) var(--padding-medium);
        border: var(--view-border);
        border-radius: var(--view-border-radius);
        color: var(--text-primary);
        background-color: var(--color-background-tertiary);
        font-size: var(--text-size-small);
        font-weight: var(--text-weight-medium);

        &:hover {
          background-color: var(--hover-bg);
          border-color: var(--color-border-light);
        }
      }
    }

    .main-content {
      display: flex;
      flex-direction: column;
      width: 100%;
      max-width: var(--content-max-width);
      margin: 0 auto;
      padding: var(--padding-medium);
      flex: 1;
    }
  `],
  imports: [
    RouterModule,
    ButtonComponent,
    EventDiceRollComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameSessionPageComponent {
  protected router = inject(Router);
  protected route = inject(ActivatedRoute);
  protected currentGameSession = inject(CurrentGameSessionState);
  protected currentParticipantState = inject(CurrentParticipantState);
  protected modalService = inject(ModalService);
  protected gameEventRepository = inject(GameEventRepository);
  protected eventsCenterState = inject(EventsCenterStateService);
  protected eventCount = computed(() => this.eventsCenterState.events().length);

  protected openMainMenu(): void {
    const ref = this.modalService.openLeftPanel(MainMenuComponent);
    ref.componentRef.instance.close.subscribe(() => {
      void ref.close();
    });
  }

  protected lastRunningDiceEvent = computed(() => {
    return this.eventsCenterState.events().reduce<EventMeta<EventDiceRoll> | undefined>((latest, e) => {
      if (e.event.type !== 'dice-roll') return latest;
      if (!latest || e.event.timestamp > latest.event.timestamp) return e as EventMeta<EventDiceRoll>;
      return latest;
    }, undefined);
  });

  protected runDice(faces: number): void {

    const currentParticipant = this.currentParticipantState.currentParticipant()!;

    const event: Omit<EventDiceRoll, 'id' | 'timestamp'> = {
      type: 'dice-roll',
      triggeringPlayerId: currentParticipant.type === 'player' ? currentParticipant.id : null,
      gameSessionId: this.currentGameSession.currentGameSession().id,
      result: Math.floor(Math.random() * faces) + 1,
      sides: faces,
    };
    
    this.gameEventRepository.postCommand(event).subscribe();
  }
  protected goToEvents(): void {
    void this.router.navigate([
      PageMasterRoutes().GameInstanceSession.children[1].path,
    ], { relativeTo: this.route,
    });
  }
}