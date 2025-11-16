import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { GameInstance } from '@pagemaster/common/pagemaster.types';
import { tap } from 'rxjs';
import { ButtonComponent } from '../../../core/design-system/button.component';
import { CardComponent } from '../../../core/design-system/card.component';
import { DividerComponent } from '../../../core/design-system/divider.component';
import { GameInstanceFormComponent } from '../../../core/game/game-instance-form.component';
import { PageMasterRoutes } from '../../../core/pagemaster.router';
import { GameInstanceRepository } from '../../../core/repositories/game-instance.repository';

@Component({
  selector: 'app-game-instance-config',
  template: `
    <div class="container">
      @if (!newGameInstance()) {
        <div class="header">
          <h1>Configure Your Game Instance</h1>
          <p class="subtitle">Set up your game master profile to begin</p>
        </div>
        
        <app-game-instance-form (newGameInstance)="onNewGame($event)"></app-game-instance-form>
      }

      @if (newGameInstance(); as instance) {
        <div class="success-container">
          <div class="header">
            <h1>🎉 Game Instance Created!</h1>
            <p class="subtitle">Your game is ready to start</p>
          </div>

          <ds-card class="success-card">
            <div class="success-content">
              <div class="info-section">
                <h3>Game Details</h3>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="info-label">Game System:</span>
                    <span class="info-value">{{ instance.id }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Game Master:</span>
                    <span class="info-value">{{ instance.masterName }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Instance ID:</span>
                    <span class="info-value code">{{ instance.id }}</span>
                  </div>
                </div>
              </div>

              <ds-divider></ds-divider>

              <div class="info-section">
                <h3>Share with Players</h3>
                <p class="share-description">Send this link to your players so they can join the game:</p>
                <div class="link-container">
                  <a [routerLink]="gameInstanceLink()" class="game-link">
                    {{ getFullLink() }}
                  </a>
                </div>
              </div>
            </div>

            <div class="actions">
              <ds-button 
                [mode]="'primary'" 
                [routerLink]="gameInstanceLink()">
                Enter Game Session
              </ds-button>
            </div>
          </ds-card>
        </div>
      }
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
      gap: var(--gap-xlarge, 32px);
    }

    .header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--gap-small);
      text-align: center;
    }

    h1 {
      color: var(--text-primary);
      font-size: 32px;
      font-weight: var(--text-weight-bold);
      margin: 0;
    }

    .subtitle {
      color: var(--text-secondary);
      font-size: var(--text-size-large);
      margin: 0;
      line-height: 1.5;
    }

    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: var(--padding-large);
      min-height: 200px;
    }

    .loading p {
      color: var(--text-secondary);
      font-size: var(--text-size-medium);
      font-style: italic;
    }

    .success-container {
      display: flex;
      flex-direction: column;
      gap: var(--gap-xlarge, 32px);
    }

    .success-card {
      display: flex;
      flex-direction: column;
      gap: var(--gap-large);
      max-width: 700px;
      margin: 0 auto;
      width: 100%;
      background: linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.05) 0%, rgba(var(--color-primary-rgb), 0.1) 100%);
      border: 2px solid var(--color-primary);
    }

    .success-content {
      display: flex;
      flex-direction: column;
      gap: var(--gap-large);
    }

    .info-section {
      display: flex;
      flex-direction: column;
      gap: var(--gap-medium);
    }

    .info-section h3 {
      color: var(--text-primary);
      font-size: var(--text-size-large);
      font-weight: var(--text-weight-bold);
      margin: 0;
    }

    .info-grid {
      display: flex;
      flex-direction: column;
      gap: var(--gap-medium);
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: var(--gap-xsmall, 4px);
    }

    .info-label {
      color: var(--text-secondary);
      font-size: var(--text-size-small);
      font-weight: var(--text-weight-medium);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-value {
      color: var(--text-primary);
      font-size: var(--text-size-medium);
      font-weight: var(--text-weight-medium);
    }

    .info-value.code {
      font-family: monospace;
      background-color: var(--color-background-secondary);
      padding: var(--padding-small);
      border-radius: 4px;
      font-size: var(--text-size-small);
      word-break: break-all;
    }

    .share-description {
      color: var(--text-secondary);
      font-size: var(--text-size-medium);
      margin: 0;
      line-height: 1.5;
    }

    .link-container {
      display: flex;
      flex-direction: column;
      gap: var(--gap-small);
      background-color: var(--color-background-secondary);
      padding: var(--padding-medium);
      border-radius: var(--view-border-radius);
      border: 1px solid var(--color-border);
    }

    .game-link {
      color: var(--color-primary);
      font-size: var(--text-size-medium);
      font-weight: var(--text-weight-medium);
      text-decoration: none;
      word-break: break-all;
      transition: color var(--transition-speed) ease;
    }

    .game-link:hover {
      color: var(--color-primary-dark, var(--color-primary));
      text-decoration: underline;
    }

    .actions {
      display: flex;
      justify-content: center;
      padding-top: var(--padding-small);
      border-top: 1px solid var(--color-border);
    }

    ds-button {
      min-width: 200px;
    }

    @media (max-width: 768px) {
      .container {
        padding: var(--padding-medium);
      }

      h1 {
        font-size: 24px;
      }

      .subtitle {
        font-size: var(--text-size-medium);
      }

      ds-button {
        width: 100%;
      }
    }
  `],
  imports: [
    GameInstanceFormComponent,
    RouterModule,
    CardComponent,
    ButtonComponent,
    DividerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameInstanceConfigComponent {
  protected gameInstanceService = inject(GameInstanceRepository);
  protected route = inject(ActivatedRoute);
  protected newGameInstance = signal<GameInstance | null>(null);
  protected gameInstanceLink = signal<string | null>(null);

  protected onNewGame(gameInstance: GameInstance) {
    this.gameInstanceService.postGameInstance(gameInstance).pipe(
      tap(createdInstance => {
        this.gameInstanceLink.set(`/${PageMasterRoutes().GameInstanceSession.interpolated(createdInstance.id)}`);
        this.newGameInstance.set(createdInstance);
      }),
    ).subscribe();
  }

  protected getFullLink(): string {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${this.gameInstanceLink()}`;
    }
    return this.gameInstanceLink() || '';
  }
}