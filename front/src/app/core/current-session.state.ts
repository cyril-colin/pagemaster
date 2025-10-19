import { computed, inject, Injectable, InputSignal } from '@angular/core';
import { map, tap } from 'rxjs';
import { Character } from '../../pagemaster-schemas/src/pagemaster.types';
import { PageMasterSocketEvents } from '../../pagemaster-schemas/src/socket-events.types';
import { CurrentGameInstanceState } from './current-game-instance.state';
import { CurrentParticipantState } from './current-participant.state';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root',
})
export class CurrentSessionState {
  protected currentGameState = inject(CurrentGameInstanceState);
  protected currentParticipantState = inject(CurrentParticipantState);
  private currentParticipant = computed(() => {
    const participants = this.currentGameState.currentGameInstance()?.participants || [];
    const currentParticipantId = this.currentParticipantState.currentParticipant();
    const currentParticipant = participants.find(p => p.id === currentParticipantId);
    if (!currentParticipant) {
      throw new Error(`No participant with id <${currentParticipantId}>`
        +` found in GameInstance <${this.currentGameState.currentGameInstance()?.id}>`);
    }
    return currentParticipant;
  });
  protected socketService = inject(SocketService);
  
  public currentSession = computed(() => {
    const gameInstance = this.currentGameState.currentGameInstance();
    const participant = this.currentParticipant();
    if (!gameInstance || !participant) {
      throw new Error('No current session available');
    }

    return { gameInstance, participant };
  });

  public currentSessionNullable = computed(() => {
    try {
      return this.currentSession();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch(_) {
      return null;
    }
  });

  public allowedToEditCharacterSnapshot(characterToEdit: Character) {
    const currentParticipant = this.currentParticipant();
    return currentParticipant.type === 'gameMaster' || characterToEdit.id === currentParticipant.character.id;
  }

  public allowedToEditCharacter = (characterToEdit: InputSignal<Character>) => computed(() => {
    return this.allowedToEditCharacterSnapshot(characterToEdit());
  });

  public init() {
    return this.currentGameState.init().pipe(
      tap(gameInstance => {
        if (!gameInstance) {
          throw new Error('No current game instance set');
        }
        return this.currentParticipantState.init(gameInstance);
      }),
      map(() => this.currentSession()),
    );
  }

  

  public logout() {
    const currentGameInstance = this.currentGameState.currentGameInstance();
    this.currentGameState.clearCurrentGameInstance();
    this.currentParticipantState.clearParticipant();
    this.socketService.emit(PageMasterSocketEvents.LEAVE_GAME_INSTANCE, { gameInstanceId: currentGameInstance?.id || 'unknown' });
  }
}