import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GameDef } from '@pagemaster/common/pagemaster.types';


@Injectable({providedIn: 'root'})
export class GameDefService {
  public randomId = Math.random().toString(36).substring(2, 15);
  private readonly baseUrl = 'http://localhost:8080/api';
  private http = inject(HttpClient);

  getAllGameDefs(): Observable<GameDef[]> {
    return this.http.get<GameDef[]>(`${this.baseUrl}/gamedefs`);
  }

  getGameDefById(id: string): Observable<GameDef> {
    return this.http.get<GameDef>(`${this.baseUrl}/gamedefs/${id}`);
  }

}
