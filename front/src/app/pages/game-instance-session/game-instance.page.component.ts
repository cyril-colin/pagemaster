import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Player } from '@pagemaster/common/pagemaster.types';

import { CurrentSessionState } from 'src/app/core/current-session.state';
import { ButtonComponent } from 'src/app/core/design-system/button.component';
import { EventsCenterStateService } from 'src/app/core/events-center/events-center.state';
import { ModalService } from 'src/app/core/modal';
import { PageMasterRoutes } from 'src/app/core/pagemaster.router';
import { GameInstanceRepository } from 'src/app/core/repositories/game-instance.repository';
import { MainMenuComponent } from './main-menu.component';

@Component({
  selector: 'app-game-instance',
  template: `
  <section class="header">
    <div class="links">
      <ds-button [icon]="'menu'" (click)="openMainMenu()"/>
      <a [routerLink]="eventsRoute()">
        Events page ({{ eventService.events().length }})
      </a>
    </div>
  </section>

  <section class="main-content">
    <router-outlet></router-outlet>
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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameInstancePageComponent {
  protected router = inject(Router);
  protected route = inject(ActivatedRoute);
  protected currentSession = inject(CurrentSessionState);
  protected gameInstanceService = inject(GameInstanceRepository);
  protected modalService = inject(ModalService);
  protected eventService = inject(EventsCenterStateService);
  protected eventsRoute = computed(() => '/' + PageMasterRoutes().GameInstanceSession.interpolated(
    this.currentSession.currentSession().gameInstance.id,
  ));

  constructor() {
    toSignal(this.eventService.init(this.currentSession.currentSession().gameInstance.id));
  }

  protected goToPlayerPage(player: Player): void {
    const route = PageMasterRoutes().GameInstanceSession.children[2].interpolated(
      player.id,
    );
    void this.router.navigate([route], { relativeTo: this.route });
  }

  protected openMainMenu(): void {
    const modalRef = this.modalService.openLeftPanel(MainMenuComponent);
    modalRef.componentRef.instance.close.subscribe(() => {
      void modalRef.close();
    });
    modalRef.componentRef.instance.playerClick.subscribe((player) => {
      this.goToPlayerPage(player);
      void modalRef.close();
    });
  }
}