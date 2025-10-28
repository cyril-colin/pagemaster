import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Item } from '@pagemaster/common/items.types';
import { Character, GameInstance, Participant } from '@pagemaster/common/pagemaster.types';
import { Observable } from 'rxjs';


@Injectable({providedIn: 'root'})
export class GameInstanceRepository {
  private readonly baseUrl = '/api';
  private http = inject(HttpClient);

  getAllGameInstances(): Observable<GameInstance[]> {
    return this.http.get<GameInstance[]>(`${this.baseUrl}/game-instances`);
  }

  getGameInstanceById(id: string): Observable<GameInstance> {
    return this.http.get<GameInstance>(`${this.baseUrl}/game-instances/${id}`);
  }

  postGameInstance(gameInstance: GameInstance): Observable<GameInstance> {
    return this.http.post<GameInstance>(`${this.baseUrl}/game-instances`, gameInstance);
  }

  putGameInstance(gameInstance: GameInstance): Observable<GameInstance> {
    return this.http.put<GameInstance>(`${this.baseUrl}/game-instances/${gameInstance.id}`, gameInstance);
  }

  updateParticipant(gameInstanceId: string, participant: Participant): Observable<Participant> {
    return this.http.put<Participant>(`${this.baseUrl}/game-instances/${gameInstanceId}/participants/${participant.id}`, participant);
  }

  renameCharacter(gameInstanceId: string, participantId: string, character: Pick<Character, 'name'>): Observable<Participant> {
    return this.http.patch<Participant>(
      `${this.baseUrl}/game-instances/${gameInstanceId}/participants/${participantId}/rename`, character);
  }

  updateCharacterAvatar(gameInstanceId: string, participantId: string, character: Pick<Character, 'picture'>): Observable<Participant> {
    return this.http.patch<Participant>(
      `${this.baseUrl}/game-instances/${gameInstanceId}/participants/${participantId}/avatar`, character);
  }

  updateCharacterDescription(
    gameInstanceId: string, participantId: string, character: Pick<Character, 'description'>,
  ): Observable<Participant> {
    return this.http.patch<Participant>(
      `${this.baseUrl}/game-instances/${gameInstanceId}/participants/${participantId}/description`, character);
  }

  updateCharacterBars(
    gameInstanceId: string, participantId: string, attributes: Pick<Character['attributes'], 'bar'>,
  ): Observable<Participant> {
    return this.http.patch<Participant>(
      `${this.baseUrl}/game-instances/${gameInstanceId}/participants/${participantId}/bars`, attributes);
  }

  updateCharacterStatuses(
    gameInstanceId: string, participantId: string, attributes: Pick<Character['attributes'], 'status'>,
  ): Observable<Participant> {
    return this.http.patch<Participant>(
      `${this.baseUrl}/game-instances/${gameInstanceId}/participants/${participantId}/statuses`, attributes);
  }

  updateCharacterStrengths(
    gameInstanceId: string, participantId: string, attributes: Pick<Character['attributes'], 'strength'>,
  ): Observable<Participant> {
    return this.http.patch<Participant>(
      `${this.baseUrl}/game-instances/${gameInstanceId}/participants/${participantId}/strengths`, attributes);
  }

  updateCharacterWeaknesses(
    gameInstanceId: string, participantId: string, attributes: Pick<Character['attributes'], 'weakness'>,
  ): Observable<Participant> {
    return this.http.patch<Participant>(
      `${this.baseUrl}/game-instances/${gameInstanceId}/participants/${participantId}/weaknesses`, attributes);
  }

  addItem(gameInstanceId: string, item: Item): Observable<GameInstance> {
    return this.http.post<GameInstance>(`${this.baseUrl}/game-instances/${gameInstanceId}/items`, item);
  }

}
