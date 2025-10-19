import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, tap } from 'rxjs';
import { GameInstance, Participant } from '@pagemaster/common/pagemaster.types';
import { CurrentGameInstanceState } from '../../core/current-game-instance.state';
import { CurrentParticipantState } from '../../core/current-participant.state';
import { PageMasterRoutes } from '../../core/pagemaster.router';
import { GameInstanceService } from '../../core/repositories/game-instance.service';

@Component({
  selector: 'app-game-instance-session-choose-participant',
  template: `
    <div>
      <h1>Game Instance Session</h1>
       @let instance = selectedGameInstance();
       @if (instance) {
         @for(participant of instance.participants; track participant.id) {
          @if(participant.type === 'player') {
            <button (click)="selectParticipant(instance, participant)">
              {{ participant.name }} playing as {{ participant.character.name }}
            </button>
          } @else {
            <button (click)="selectParticipant(instance, participant)">{{ participant.name }} playing as Game Master</button>
         }
       }
      }
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameInstanceSessionChooseParticipantComponent {
  protected route = inject(ActivatedRoute);
  protected router = inject(Router);
  protected gameInstanceService = inject(GameInstanceService);
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
}