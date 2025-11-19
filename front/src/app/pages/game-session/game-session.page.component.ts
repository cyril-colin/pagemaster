import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { CurrentGameSessionState } from 'src/app/core/current-game-session.state';
import { ButtonComponent } from 'src/app/core/design-system/button.component';
import { EventsCenterStateService } from 'src/app/core/events-center/events-center.state';
import { ModalService } from 'src/app/core/modal';
import { PageMasterRoutes } from 'src/app/core/pagemaster.router';
import { MainMenuComponent } from './main-menu.component';

@Component({
  selector: 'app-game-session',
  template: `
  <section class="header">
    <div class="links">
      <ds-button [icon]="'menu'" (click)="openMainMenu()"/>
      <ds-button (click)="goToEvents()" [mode]="'secondary'">Events Center ({{ eventCount() }})</ds-button>
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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameSessionPageComponent {
  protected router = inject(Router);
  protected route = inject(ActivatedRoute);
  protected currentGameSession = inject(CurrentGameSessionState);
  protected modalService = inject(ModalService);
  protected eventsCenterState = inject(EventsCenterStateService);
  protected eventCount = computed(() => this.eventsCenterState.events().length);

  protected openMainMenu(): void {
    const ref = this.modalService.openLeftPanel(MainMenuComponent);
    ref.componentRef.instance.close.subscribe(() => {
      void ref.close();
    });
  }

  protected goToEvents(): void {
    void this.router.navigate([
      PageMasterRoutes().GameInstanceSession.children[1].path,
    ], { relativeTo: this.route,
    });
  }
}