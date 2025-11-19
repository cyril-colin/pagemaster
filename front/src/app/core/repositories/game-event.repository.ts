import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { EventBase } from '@pagemaster/common/events.types';
import { Observable } from 'rxjs';


@Injectable({providedIn: 'root'})
export class GameEventRepository {
  private readonly baseUrl = '/api';
  private http = inject(HttpClient);

  postCommand(command: Omit<EventBase, 'id'>): Observable<EventBase> {
    return this.http.post<EventBase>(`${this.baseUrl}/game-events/command`, command);
  }

  getAll(): Observable<EventBase[]> {
    return this.http.get<EventBase[]>(`${this.baseUrl}/game-events`);
  }

}
