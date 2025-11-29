import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { EventDiceRoll } from '@pagemaster/common/events.types';
import { CurrentGameSessionState } from 'src/app/core/current-game-session.state';
import { CurrentParticipantState } from 'src/app/core/current-participant.state';
import { BottomBarComponent } from 'src/app/core/design-system/bottom-bar.component';
import { ButtonComponent } from 'src/app/core/design-system/button.component';
import { EventDiceRollComponent } from 'src/app/core/events-center/event-views/event-dice-roll.component';
import { EventMeta, EventsCenterStateService } from 'src/app/core/events-center/events-center.state';
import { ModalService } from 'src/app/core/modal';
import { PageMasterRoutes } from 'src/app/core/pagemaster.router';
import { GameEventRepository } from 'src/app/core/repositories/game-event.repository';
import { QuickActionModalComponent } from './quick-action.modal.component';

@Component({
  selector: 'app-game-session',
  template: `
  <section class="header">
    <div class="links">
      @let e = lastRunningDiceEvent();
      @if (e) {
          <app-event-dice-roll [event]="e"></app-event-dice-roll>
        }

      <ds-button mode="secondary-danger" (click)="logout()" [icon]="'logout'"/>
    </div>
  </section>

  <section class="main-content">
    <router-outlet />
  </section>

  <footer>
    <ds-bottom-bar
     (quickAction)="runQuickAction()"
        [eventCount]="eventCount()"
      (history)="goToEvents()"
      (me)="goToMyPlayerPage()"
    (session)="goToPlayerList()" />
  </footer>
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
      flex: 1; // extra space for visibility
      padding-bottom: calc(var(--footer-height) + 30px);
    }

    footer {
      position: fixed;
      z-index: 100;
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%;
      height: var(--footer-height);
      background-color: var(--color-background-secondary);
      border-top: var(--view-border);
      display: flex;
      flex-direction: column;
      box-shadow: 0 -2px 8px var(--color-shadow-heavy);
    }
  `],
  imports: [
    RouterModule,
    ButtonComponent,
    EventDiceRollComponent,
    BottomBarComponent,
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
  protected eventCount = computed(() => this.eventsCenterState.events().filter(e => e.isNew).length);


  protected goToPlayerList(): void {
    void this.router.navigate([
      PageMasterRoutes().GameInstanceSession.children[2].path,
    ], { relativeTo: this.route,
    });
  }

  protected async logout(): Promise<void> {
    const response = await this.modalService.confirmation('Are youre sure you want to logout?', 'Logout');
    if (response === 'confirmed') {
      this.currentParticipantState.logout();
    }
  }

  protected goToMyPlayerPage(): void {
    const currentParticipant = this.currentParticipantState.currentParticipant()!;
    if (currentParticipant.type !== 'player') return;

    void this.router.navigate([
      PageMasterRoutes().GameInstanceSession.children[3].interpolated(currentParticipant.id),
    ], { relativeTo: this.route,
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

  protected runQuickAction(): void {
    const modalRef = this.modalService.open(QuickActionModalComponent);
    modalRef.componentRef.instance.d6.subscribe(() => {
      this.runDice(6);
      void modalRef.close();
    });

    modalRef.componentRef.instance.d20.subscribe(() => {
      this.runDice(20);
      void modalRef.close();
    });
  }
}