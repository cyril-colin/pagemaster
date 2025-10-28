import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Item } from '@pagemaster/common/items.types';
import { GameInstance, Participant } from '@pagemaster/common/pagemaster.types';
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

  addItem(gameInstanceId: string, item: Item): Observable<GameInstance> {
    return this.http.post<GameInstance>(`${this.baseUrl}/game-instances/${gameInstanceId}/items`, item);
  }

}
