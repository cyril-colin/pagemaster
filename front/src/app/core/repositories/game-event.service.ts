import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { GameEvent } from '@pagemaster/common/pagemaster.types';
import { Observable } from 'rxjs';


@Injectable({providedIn: 'root'})
export class GameEventService {
  private readonly baseUrl = '/api';
  private http = inject(HttpClient);

  getAllGameEvents(): Observable<GameEvent[]> {
    return this.http.get<GameEvent[]>(`${this.baseUrl}/game-events`);
  }

  getGameEventById(id: string): Observable<GameEvent> {
    return this.http.get<GameEvent>(`${this.baseUrl}/game-events/${id}`);
  }

  getGameEventsByGameInstanceId(gameInstanceId: string): Observable<GameEvent[]> {
    return this.http.get<GameEvent[]>(`${this.baseUrl}/game-instances/${gameInstanceId}/game-events`);
  }

  getGameEventsByParticipantId(participantId: string): Observable<GameEvent[]> {
    return this.http.get<GameEvent[]>(`${this.baseUrl}/game-events/participant/${participantId}`);
  }

  postGameEvent(gameEvent: GameEvent): Observable<GameEvent> {
    return this.http.post<GameEvent>(`${this.baseUrl}/game-events`, gameEvent);
  }

  putGameEvent(gameEvent: GameEvent): Observable<GameEvent> {
    return this.http.put<GameEvent>(`${this.baseUrl}/game-events/${gameEvent.id}`, gameEvent);
  }

  deleteGameEvent(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.baseUrl}/game-events/${id}`);
  }

}
