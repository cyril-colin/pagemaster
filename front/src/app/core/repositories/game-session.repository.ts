import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { GameSession, Participant } from '@pagemaster/common/pagemaster.types';
import { Observable } from 'rxjs';


@Injectable({providedIn: 'root'})
export class GameSessionRepository {
  private readonly baseUrl = '/api';
  private http = inject(HttpClient);

  getAllGameInstances(): Observable<GameSession[]> {
    return this.http.get<GameSession[]>(`${this.baseUrl}/game-sessions`);
  }

  getGameSessionById(id: string): Observable<GameSession> {
    return this.http.get<GameSession>(`${this.baseUrl}/game-sessions/${id}`);
  }

  postGameSession(gameSession: GameSession): Observable<GameSession> {
    return this.http.post<GameSession>(`${this.baseUrl}/game-sessions`, gameSession);
  }

  putGameSession(gameSession: GameSession): Observable<GameSession> {
    return this.http.put<GameSession>(`${this.baseUrl}/game-sessions/${gameSession.id}`, gameSession);
  }

  addParticipant(gameSessionId: string, participant: Participant): Observable<GameSession> {
    return this.http.post<GameSession>(`${this.baseUrl}/game-sessions/${gameSessionId}/participants`, participant);
  }

  deleteParticipant(gameSessionId: string, participantId: string): Observable<GameSession> {
    return this.http.delete<GameSession>(`${this.baseUrl}/game-sessions/${gameSessionId}/participants/${participantId}`);
  }

  updateParticipant(gameSessionId: string, participant: Participant): Observable<Participant> {
    return this.http.put<Participant>(`${this.baseUrl}/game-sessions/${gameSessionId}/participants/${participant.id}`, participant);
  }

}
