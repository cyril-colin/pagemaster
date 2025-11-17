import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AttributeBar, AttributeInventory, AttributeStatus } from '@pagemaster/common/attributes.types';
import { Item } from '@pagemaster/common/items.types';
import { GameSession, Participant, Player } from '@pagemaster/common/pagemaster.types';
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

  renamePlayer(gameSessionId: string, participantId: string, player: Pick<Player, 'name'>): Observable<Participant> {
    return this.http.patch<Participant>(
      `${this.baseUrl}/game-sessions/${gameSessionId}/participants/${participantId}/rename`, player);
  }

  updatePlayerAvatar(gameSessionId: string, participantId: string, player: Pick<Player, 'picture'>): Observable<Participant> {
    return this.http.patch<Participant>(
      `${this.baseUrl}/game-sessions/${gameSessionId}/participants/${participantId}/avatar`, player);
  }

  updatePlayerDescription(
    gameSessionId: string, participantId: string, player: Pick<Player, 'description'>,
  ): Observable<Participant> {
    return this.http.patch<Participant>(
      `${this.baseUrl}/game-sessions/${gameSessionId}/participants/${participantId}/description`, player);
  }

  updatePlayerBars(
    gameSessionId: string, participantId: string, attributes: Pick<Player['attributes'], 'bar'>,
  ): Observable<Participant> {
    return this.http.patch<Participant>(
      `${this.baseUrl}/game-sessions/${gameSessionId}/participants/${participantId}/bars`, attributes);
  }

  addPlayerBar(
    gameSessionId: string,
    participantId: string,
    bar: AttributeBar,
  ): Observable<Participant> {
    return this.http.post<Participant>(
      `${this.baseUrl}/game-sessions/${gameSessionId}/participants/${participantId}/bars`,
      bar,
    );
  }

  updatePlayerBar(
    gameSessionId: string,
    participantId: string,
    barId: string,
    bar: AttributeBar,
  ): Observable<Participant> {
    return this.http.put<Participant>(
      `${this.baseUrl}/game-sessions/${gameSessionId}/participants/${participantId}/bars/${barId}`,
      bar,
    );
  }

  deletePlayerBar(
    gameSessionId: string,
    participantId: string,
    barId: string,
  ): Observable<Participant> {
    return this.http.delete<Participant>(
      `${this.baseUrl}/game-sessions/${gameSessionId}/participants/${participantId}/bars/${barId}`,
    );
  }

  updatePlayerStatuses(
    gameSessionId: string, participantId: string, attributes: Pick<Player['attributes'], 'status'>,
  ): Observable<Participant> {
    return this.http.patch<Participant>(
      `${this.baseUrl}/game-sessions/${gameSessionId}/participants/${participantId}/statuses`, attributes);
  }

  deletePlayerStatus(
    gameSessionId: string, participantId: string, statusId: string,
  ): Observable<Participant> {
    return this.http.delete<Participant>(
      `${this.baseUrl}/game-sessions/${gameSessionId}/participants/${participantId}/statuses/${statusId}`);
  }

  addPlayerStatus(
    gameSessionId: string,
    participantId: string,
    status: AttributeStatus,
  ): Observable<Participant> {
    return this.http.post<Participant>(
      `${this.baseUrl}/game-sessions/${gameSessionId}/participants/${participantId}/statuses`,
      status,
    );
  }

  updatePlayerStatus(
    gameSessionId: string,
    participantId: string,
    statusId: string,
    status: AttributeStatus,
  ): Observable<Participant> {
    return this.http.put<Participant>(
      `${this.baseUrl}/game-sessions/${gameSessionId}/participants/${participantId}/statuses/${statusId}`,
      status,
    );
  }

  updatePlayerInventories(
    gameSessionId: string, participantId: string, attributes: Pick<Player['attributes'], 'inventory'>,
  ): Observable<Participant> {
    return this.http.patch<Participant>(
      `${this.baseUrl}/game-sessions/${gameSessionId}/participants/${participantId}/inventories`, attributes);
  }

  addItem(gameSessionId: string, item: Item): Observable<GameSession> {
    return this.http.post<GameSession>(`${this.baseUrl}/game-sessions/${gameSessionId}/items`, item);
  }

  addItemToInventory(
    gameSessionId: string,
    participantId: string,
    inventoryId: string,
    item: Item,
  ): Observable<Participant> {
    return this.http.post<Participant>(
      `${this.baseUrl}/game-sessions/${gameSessionId}/participants/${participantId}/inventories/${inventoryId}/items`,
      item,
    );
  }

  editItemInInventory(
    gameSessionId: string,
    participantId: string,
    inventoryId: string,
    item: Item,
  ): Observable<Participant> {
    return this.http.put<Participant>(
      `${this.baseUrl}/game-sessions/${gameSessionId}/participants/${participantId}/inventories/${inventoryId}/items/${item.id}`,
      item,
    );
  }

  deleteItemFromInventory(
    gameSessionId: string,
    participantId: string,
    inventoryId: string,
    itemId: string,
  ): Observable<Participant> {
    return this.http.delete<Participant>(
      `${this.baseUrl}/game-sessions/${gameSessionId}/participants/${participantId}/inventories/${inventoryId}/items/${itemId}`,
    );
  }

  addInventoryForPlayer(
    gameSessionId: string,
    participantId: string,
    inventory: AttributeInventory,
  ): Observable<Participant> {
    return this.http.post<Participant>(
      `${this.baseUrl}/game-sessions/${gameSessionId}/participants/${participantId}/inventories/add`,
      inventory,
    );
  }

  updateInventoryForPlayer(
    gameSessionId: string,
    participantId: string,
    inventoryId: string,
    inventory: AttributeInventory,
  ): Observable<Participant> {
    return this.http.put<Participant>(
      `${this.baseUrl}/game-sessions/${gameSessionId}/participants/${participantId}/inventories/${inventoryId}/update`,
      inventory,
    );
  }

  deleteInventoryForPlayer(
    gameSessionId: string,
    participantId: string,
    inventoryId: string,
  ): Observable<Participant> {
    return this.http.delete<Participant>(
      `${this.baseUrl}/game-sessions/${gameSessionId}/participants/${participantId}/inventories/${inventoryId}/delete`,
      {},
    );
  }

}
