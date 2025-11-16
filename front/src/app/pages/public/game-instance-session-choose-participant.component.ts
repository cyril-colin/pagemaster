import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { GameInstance, Participant } from '@pagemaster/common/pagemaster.types';
import { switchMap, tap } from 'rxjs';
import { CurrentGameInstanceState } from '../../core/current-game-instance.state';
import { CurrentParticipantState } from '../../core/current-participant.state';
import { ButtonComponent } from '../../core/design-system/button.component';
import { CardComponent } from '../../core/design-system/card.component';
import { PageMasterRoutes } from '../../core/pagemaster.router';
import { GameInstanceRepository } from '../../core/repositories/game-instance.repository';

@Component({
  selector: 'app-game-instance-session-choose-participant',
  imports: [ButtonComponent, CardComponent],
  template: `
    <div class="container">
      <h1>Choose Your Character</h1>
      @let instance = selectedGameInstance();
      @if (instance) {
        <p class="subtitle">{{ instance.id }} - Master: {{ getGameMasterName(instance) }}</p>
        
        <div class="participants-grid">
          @for(participant of instance.participants; track participant.id) {
            <ds-card class="participant-card">
              @if(participant.type === 'player') {
                <div class="participant-info">
                  <h3 class="participant-name">{{ participant.character.name }}</h3>
                  <p class="player-name">Played by {{ participant.name }}</p>
                </div>
                <ds-button 
                  [mode]="'primary'" 
                  (click)="selectParticipant(instance, participant)">
                  Play as {{ participant.character.name }}
                </ds-button>
              } @else {
                <div class="participant-info">
                  <h3 class="participant-name">Game Master</h3>
                  <p class="player-name">{{ participant.name }}</p>
                </div>
                <ds-button 
                  [mode]="'secondary'" 
                  (click)="selectParticipant(instance, participant)">
                  Join as Game Master
                </ds-button>
              }
            </ds-card>
          }
        </div>
      } @else {
        <p class="loading">Loading game instance...</p>
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
      align-items: center;
      padding: var(--padding-large);
      width: 100%;
      max-width: var(--content-max-width);
      margin: 0 auto;
      gap: var(--gap-large);
    }

    h1 {
      color: var(--color-primary);
      font-size: 32px;
      font-weight: var(--text-weight-bold);
      text-align: center;
      margin: 0;
    }

    .subtitle {
      color: var(--text-secondary);
      font-size: var(--text-size-large);
      text-align: center;
      margin: 0;
    }

    .participants-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--gap-large);
      width: 100%;
      max-width: 900px;
    }

    .participant-card {
      display: flex;
      flex-direction: column;
      gap: var(--gap-medium);
      padding: var(--padding-large);
      transition: transform var(--transition-speed) ease, 
                  box-shadow var(--transition-speed) ease;
      cursor: pointer;
    }

    .participant-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px var(--color-shadow-heavy);
      border-color: var(--color-primary);
    }

    .participant-info {
      display: flex;
      flex-direction: column;
      gap: var(--gap-small);
      flex: 1;
    }

    .participant-name {
      color: var(--text-primary);
      font-size: var(--text-size-xlarge);
      font-weight: var(--text-weight-bold);
      margin: 0;
    }

    .player-name {
      color: var(--text-secondary);
      font-size: var(--text-size-medium);
      margin: 0;
    }

    .loading {
      color: var(--text-secondary);
      font-size: var(--text-size-large);
      text-align: center;
    }

    ds-button {
      width: 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameInstanceSessionChooseParticipantComponent {
  protected route = inject(ActivatedRoute);
  protected router = inject(Router);
  protected gameInstanceService = inject(GameInstanceRepository);
  protected currentParticipantService = inject(CurrentParticipantState);
  protected currentGameInstanceService = inject(CurrentGameInstanceState);
  protected selectedGameInstance = toSignal(this.route.paramMap.pipe(
    switchMap(params => {
      const instanceId = params.get(PageMasterRoutes().GameInstanceSession.params[0]);
      if (!instanceId) {
        throw new Error('No instanceId in route parameters');
      }
      return this.gameInstanceService.getGameInstanceById(instanceId);
    }),
  ));

  protected selectParticipant(gameInstance: GameInstance, participant: Participant) {
   
    this.currentGameInstanceService.setCurrentGameInstance(gameInstance).pipe(
      tap((newInstance) => {
        this.currentParticipantService.setParticipant(participant.id);
        void this.router.navigate(['/', ...PageMasterRoutes().GameInstanceSession.interpolated(newInstance.id).split('/')]);
      }),
    ).subscribe();
  }

  protected getGameMasterName(gameInstance: GameInstance): string {
    const master = gameInstance.participants.find(p => p.type === 'gameMaster');
    return master ? master.name : 'Unknown';
  }
}