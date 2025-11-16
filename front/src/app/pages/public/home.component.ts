import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { MainTitleService } from 'src/app/core/main-bar/main-title.service';
import { CurrentSessionState } from '../../core/current-session.state';
import { ButtonComponent } from '../../core/design-system/button.component';
import { CardComponent } from '../../core/design-system/card.component';
import { DividerComponent } from '../../core/design-system/divider.component';
import { PageMasterRoutes } from '../../core/pagemaster.router';
import { GameInstanceRepository } from '../../core/repositories/game-instance.repository';

@Component({
  selector: 'app-home',
  template: `
    <div class="container">
      <div class="hero">
        <h1>Welcome to PageMaster</h1>
        <p class="subtitle">Your tabletop RPG companion</p>
      </div>

      @if (currentSession(); as session) {
        <ds-card class="current-session-card">
          <div class="card-content">
            <h3>Your Active Session</h3>
            <p class="session-game">{{ session.gameInstance.id }}</p>
            <p class="session-participant">
              Playing as: <strong>{{ session.participant.name }}</strong>
              @if (session.participant.type === 'player') {
                <span class="character-badge">({{ session.participant.character.name }})</span>
              }
              @if (session.participant.type === 'gameMaster') {
                <span class="gm-badge">🎭 Game Master</span>
              }
            </p>
          </div>
          <ds-button 
            [mode]="'primary'" 
            [routerLink]="'/' + routes.GameInstanceSession.interpolated(session.gameInstance.id)">
            Continue Session
          </ds-button>
        </ds-card>
      }

      <div class="actions-section">
        <h2>Quick Actions</h2>
        <div class="actions-grid">
          <ds-card class="action-card">
            <div class="card-content">
              <h3>New Session</h3>
              <p>Start a fresh game with your players</p>
            </div>
            <ds-button 
              [mode]="'primary'" 
              [routerLink]="'/' + routes.GameInstanceConfig.path">
              Create Session
            </ds-button>
          </ds-card>
        </div>
      </div>

      <ds-divider></ds-divider>

      <div class="instances-section">
        <h2>Your Game Instances</h2>
        @if (instanceList().length > 0) {
          <div class="instances-list">
            @for (instance of instanceList(); track instance.id) {
              <ds-card class="instance-card">
                <div class="instance-info">
                  <h3 class="instance-name">{{ instance.id }}</h3>
                  <p class="instance-details">
                    <span class="label">Game Master:</span> {{ instance.masterName }}
                  </p>
                  <p class="instance-id">ID: {{ instance.id }}</p>
                </div>
                <ds-button 
                  [mode]="'secondary'" 
                  [routerLink]="'/' + routes.GameInstanceSession.interpolated(instance.id)">
                  Continue Game
                </ds-button>
              </ds-card>
            }
          </div>
        } @else {
          <div class="empty-state">
            <p>No existing game instances found.</p>
            <p class="hint">Create a new session to get started!</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      width: 100%;
      min-height: 100vh;
    }

    .container {
      display: flex;
      flex-direction: column;
      padding: var(--padding-large);
      width: 100%;
      max-width: var(--content-max-width);
      margin: 0 auto;
      gap: var(--gap-large);
    }

    .hero {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--gap-small);
      padding: var(--padding-large) 0;
    }

    h1 {
      color: var(--color-primary);
      font-size: 48px;
      font-weight: var(--text-weight-bold);
      text-align: center;
      margin: 0;
    }

    .subtitle {
      color: var(--text-secondary);
      font-size: var(--text-size-xlarge);
      text-align: center;
      margin: 0;
    }

    .current-session-card {
      display: flex;
      flex-direction: column;
      gap: var(--gap-medium);
      padding: var(--padding-large);
      background: linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%);
      border: 2px solid var(--color-primary);
      box-shadow: 0 4px 12px var(--color-shadow-heavy);
    }

    .current-session-card .card-content h3 {
      color: var(--color-text-on-primary);
      font-size: var(--text-size-xlarge);
      font-weight: var(--text-weight-bold);
      margin: 0;
    }

    .current-session-card .card-content p {
      margin: var(--gap-small) 0 0 0;
    }

    .session-game {
      color: var(--color-text-on-primary);
      font-size: var(--text-size-large);
      font-weight: var(--text-weight-bold);
      margin: var(--gap-small) 0 0 0;
    }

    .session-participant {
      color: var(--color-text-on-primary);
      font-size: var(--text-size-medium);
      display: flex;
      align-items: center;
      gap: var(--gap-small);
      flex-wrap: wrap;
    }

    .session-participant strong {
      font-weight: var(--text-weight-bold);
    }

    .character-badge {
      color: var(--color-text-on-primary);
      font-style: italic;
      opacity: 0.9;
    }

    .gm-badge {
      background-color: var(--color-background-main);
      color: var(--color-primary);
      padding: 2px 8px;
      border-radius: 4px;
      font-size: var(--text-size-small);
      font-weight: var(--text-weight-bold);
    }

    .actions-section,
    .instances-section {
      display: flex;
      flex-direction: column;
      gap: var(--gap-medium);
    }

    h2 {
      color: var(--text-primary);
      font-size: 24px;
      font-weight: var(--text-weight-bold);
      margin: 0;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: var(--gap-large);
    }

    .action-card {
      display: flex;
      flex-direction: column;
      gap: var(--gap-medium);
      padding: var(--padding-large);
      transition: transform var(--transition-speed) ease, 
                  box-shadow var(--transition-speed) ease;
      cursor: pointer;
    }

    .action-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px var(--color-shadow-heavy);
      border-color: var(--color-primary);
    }

    .card-content {
      display: flex;
      flex-direction: column;
      gap: var(--gap-small);
      flex: 1;
    }

    .card-content h3 {
      color: var(--text-primary);
      font-size: var(--text-size-large);
      font-weight: var(--text-weight-bold);
      margin: 0;
    }

    .card-content p {
      color: var(--text-secondary);
      font-size: var(--text-size-medium);
      margin: 0;
      line-height: 1.5;
    }

    .instances-list {
      display: flex;
      flex-direction: column;
      gap: var(--gap-medium);
    }

    .instance-card {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: var(--gap-large);
      padding: var(--padding-large);
      transition: transform var(--transition-speed) ease, 
                  box-shadow var(--transition-speed) ease;
      cursor: pointer;
    }

    .instance-card:hover {
      transform: translateX(4px);
      border-color: var(--color-secondary);
    }

    .instance-info {
      display: flex;
      flex-direction: column;
      gap: var(--gap-small);
      flex: 1;
    }

    .instance-name {
      color: var(--text-primary);
      font-size: var(--text-size-xlarge);
      font-weight: var(--text-weight-bold);
      margin: 0;
    }

    .instance-details {
      color: var(--text-secondary);
      font-size: var(--text-size-medium);
      margin: 0;
    }

    .label {
      color: var(--text-tertiary);
      font-weight: var(--text-weight-normal);
    }

    .instance-id {
      color: var(--text-tertiary);
      font-size: var(--text-size-small);
      margin: 0;
      font-family: monospace;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--gap-small);
      padding: var(--padding-large);
      text-align: center;
    }

    .empty-state p {
      color: var(--text-secondary);
      font-size: var(--text-size-medium);
      margin: 0;
    }

    .hint {
      color: var(--text-tertiary);
      font-size: var(--text-size-small);
      font-style: italic;
    }

    ds-button {
      min-width: 150px;
    }

    @media (max-width: 768px) {
      .actions-grid {
        grid-template-columns: 1fr;
      }

      .instance-card {
        flex-direction: column;
        align-items: flex-start;
      }

      ds-button {
        width: 100%;
      }
    }
  `],
  imports: [
    RouterModule,
    ButtonComponent,
    CardComponent,
    DividerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  protected routes = PageMasterRoutes();
  protected gameInstanceService = inject(GameInstanceRepository);
  protected instanceList = toSignal(this.gameInstanceService.getAllGameInstances(), { initialValue: [] });
  protected currentSessionState = inject(CurrentSessionState);
  protected currentSession = computed(() => {
    try {
      return this.currentSessionState.currentSessionNullable();
    } catch {
      return null;
    }
  });

  constructor() {
    inject(MainTitleService).setTitle('');
  }
}