import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { EventPlayerDescriptionEdit, EventPlayerTypes } from '@pagemaster/common/events-player.types';
import { Player } from '@pagemaster/common/pagemaster.types';
import { getPermissions } from '@pagemaster/common/permissions.types';
import { CurrentGameSessionState } from 'src/app/core/current-game-session.state';
import { CurrentParticipantState } from 'src/app/core/current-participant.state';
import { DescriptionControlComponent } from 'src/app/core/player/descriptions/description-control.component';
import { GameEventRepository } from 'src/app/core/repositories/game-event.repository';

@Component({
  selector: 'app-game-notes-view',
  template: `
    <app-description-control
      [description]="participant.currentParticipant()!.description"
      [permissions]="permissions().description"
    />
  `,
  styles: [],
  imports: [
    DescriptionControlComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotesPageComponent {
  protected gameSession = inject(CurrentGameSessionState);
  protected participant = inject(CurrentParticipantState);
  protected gameEventRepository = inject(GameEventRepository);
  protected currentSession = computed(() => {
    const gameSession = this.gameSession.currentGameSessionNullable();
    const participant = this.participant.currentParticipant();
    if (gameSession && participant) {
      return { gameSession, participant };
    }
    return null;
  });

  protected permissions = computed(() => {
    const isManager = this.participant.allowedToEditPlayerSnapshot();
    return getPermissions(isManager, true);
  });

  protected updateDescription(newDescription: string, player: Player): void {
    const gameSessionId = this.currentSession()!.gameSession.id;

    const command: Omit<EventPlayerDescriptionEdit, 'id' | 'timestamp'> = {
      type: EventPlayerTypes.PLAYER_DESCRIPTION_EDIT,
      gameSessionId,
      playerId: player.id,
      newDescription,
    };

    this.gameEventRepository.postCommand(command).subscribe();
  }

}