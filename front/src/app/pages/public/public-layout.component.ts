import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CurrentSessionState } from '../../core/current-session.state';
import { ButtonComponent } from '../../core/design-system/button.component';
import { PageMasterRoutes } from '../../core/pagemaster.router';

@Component({
  selector: 'app-public-layout',
  template: `
    <div class="layout">
      <header class="header">
        <div class="header-content">
          <ds-button 
            mode="secondary" 
            icon="arrow-left"
            [routerLink]="'/' + routes.Home.path">
            Home
          </ds-button>
          
          @if (currentSession(); as session) {
            <div class="session-info">
              <span class="session-label">Connected as:</span>
              <span class="session-details">
                {{ session.participant.name }}
                @if (session.participant.type === 'player') {
                  <span class="character-name">({{ session.participant.character.name }})</span>
                }
                @if (session.participant.type === 'gameMaster') {
                  <span class="gm-badge">🎭 GM</span>
                }
              </span>
              <span class="game-name">in {{ session.gameInstance.gameDef.name }}</span>
            </div>
          }
        </div>
      </header>
      
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      width: 100%;
      min-height: 100vh;
    }

    .layout {
      display: flex;
      flex-direction: column;
      width: 100%;
      min-height: 100vh;
    }

    .header {
      position: sticky;
      top: 0;
      z-index: 100;
      background-color: var(--color-background-secondary);
      border-bottom: var(--view-border);
      box-shadow: 0 2px 8px var(--color-shadow-heavy);
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: var(--gap-large);
      padding: var(--padding-medium);
      max-width: var(--content-max-width);
      margin: 0 auto;
      width: 100%;
    }

    .session-info {
      display: flex;
      align-items: center;
      gap: var(--gap-small);
      flex: 1;
      color: var(--text-primary);
      font-size: var(--text-size-medium);
    }

    .session-label {
      color: var(--text-secondary);
      font-weight: var(--text-weight-medium);
    }

    .session-details {
      display: flex;
      align-items: center;
      gap: var(--gap-small);
      font-weight: var(--text-weight-bold);
      color: var(--text-primary);
    }

    .character-name {
      color: var(--color-primary);
      font-style: italic;
    }

    .gm-badge {
      background-color: var(--color-primary);
      color: var(--color-text-on-primary);
      padding: 2px 8px;
      border-radius: 4px;
      font-size: var(--text-size-small);
      font-weight: var(--text-weight-bold);
    }

    .game-name {
      color: var(--text-secondary);
      font-style: italic;
    }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      width: 100%;
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--gap-medium);
      }

      .session-info {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--gap-xsmall);
      }

      .session-details {
        flex-wrap: wrap;
      }
    }
  `],
  imports: [RouterModule, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicLayoutComponent {
  protected routes = PageMasterRoutes();
  protected currentSessionState = inject(CurrentSessionState);
  protected currentSession = computed(() => {
    try {
      return this.currentSessionState.currentSessionNullable();
    } catch {
      return null;
    }
  });
}
