import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { GameDef } from '@pagemaster/common/pagemaster.types';
import { Observable } from 'rxjs';


@Injectable({providedIn: 'root'})
export class GameDefService {
  public randomId = Math.random().toString(36).substring(2, 15);
  private readonly baseUrl = '/api';
  private http = inject(HttpClient);

  getAllGameDefs(): Observable<GameDef[]> {
    return this.http.get<GameDef[]>(`${this.baseUrl}/gamedefs`);
  }

  getGameDefById(id: string): Observable<GameDef> {
    return this.http.get<GameDef>(`${this.baseUrl}/gamedefs/${id}`);
  }

}
