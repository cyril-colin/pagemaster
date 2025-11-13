import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AttributeBar, AttributeInventory, AttributeStatus } from '@pagemaster/common/attributes.types';
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

  addParticipant(gameInstanceId: string, participant: Participant): Observable<GameInstance> {
    return this.http.post<GameInstance>(`${this.baseUrl}/game-instances/${gameInstanceId}/participants`, participant);
  }

  deleteParticipant(gameInstanceId: string, participantId: string): Observable<GameInstance> {
    return this.http.delete<GameInstance>(`${this.baseUrl}/game-instances/${gameInstanceId}/participants/${participantId}`);
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

  addCharacterBar(
    gameInstanceId: string,
    participantId: string,
    bar: AttributeBar,
  ): Observable<Participant> {
    return this.http.post<Participant>(
      `${this.baseUrl}/game-instances/${gameInstanceId}/participants/${participantId}/bars`,
      bar,
    );
  }

  updateCharacterBar(
    gameInstanceId: string,
    participantId: string,
    barId: string,
    bar: AttributeBar,
  ): Observable<Participant> {
    return this.http.put<Participant>(
      `${this.baseUrl}/game-instances/${gameInstanceId}/participants/${participantId}/bars/${barId}`,
      bar,
    );
  }

  deleteCharacterBar(
    gameInstanceId: string,
    participantId: string,
    barId: string,
  ): Observable<Participant> {
    return this.http.delete<Participant>(
      `${this.baseUrl}/game-instances/${gameInstanceId}/participants/${participantId}/bars/${barId}`,
    );
  }

  updateCharacterStatuses(
    gameInstanceId: string, participantId: string, attributes: Pick<Character['attributes'], 'status'>,
  ): Observable<Participant> {
    return this.http.patch<Participant>(
      `${this.baseUrl}/game-instances/${gameInstanceId}/participants/${participantId}/statuses`, attributes);
  }

  addCharacterStatus(
    gameInstanceId: string,
    participantId: string,
    status: AttributeStatus,
  ): Observable<Participant> {
    return this.http.post<Participant>(
      `${this.baseUrl}/game-instances/${gameInstanceId}/participants/${participantId}/statuses`,
      status,
    );
  }

  updateCharacterStatus(
    gameInstanceId: string,
    participantId: string,
    statusId: string,
    status: AttributeStatus,
  ): Observable<Participant> {
    return this.http.put<Participant>(
      `${this.baseUrl}/game-instances/${gameInstanceId}/participants/${participantId}/statuses/${statusId}`,
      status,
    );
  }

  deleteCharacterStatus(
    gameInstanceId: string,
    participantId: string,
    statusId: string,
  ): Observable<Participant> {
    return this.http.delete<Participant>(
      `${this.baseUrl}/game-instances/${gameInstanceId}/participants/${participantId}/statuses/${statusId}`,
    );
  }

  updateCharacterInventories(
    gameInstanceId: string, participantId: string, attributes: Pick<Character['attributes'], 'inventory'>,
  ): Observable<Participant> {
    return this.http.patch<Participant>(
      `${this.baseUrl}/game-instances/${gameInstanceId}/participants/${participantId}/inventories`, attributes);
  }

  addItem(gameInstanceId: string, item: Item): Observable<GameInstance> {
    return this.http.post<GameInstance>(`${this.baseUrl}/game-instances/${gameInstanceId}/items`, item);
  }

  addItemToInventory(
    gameInstanceId: string,
    participantId: string,
    inventoryId: string,
    item: Item,
  ): Observable<Participant> {
    return this.http.post<Participant>(
      `${this.baseUrl}/game-instances/${gameInstanceId}/participants/${participantId}/inventories/${inventoryId}/items`,
      item,
    );
  }

  editItemInInventory(
    gameInstanceId: string,
    participantId: string,
    inventoryId: string,
    item: Item,
  ): Observable<Participant> {
    return this.http.put<Participant>(
      `${this.baseUrl}/game-instances/${gameInstanceId}/participants/${participantId}/inventories/${inventoryId}/items/${item.id}`,
      item,
    );
  }

  deleteItemFromInventory(
    gameInstanceId: string,
    participantId: string,
    inventoryId: string,
    itemId: string,
  ): Observable<Participant> {
    return this.http.delete<Participant>(
      `${this.baseUrl}/game-instances/${gameInstanceId}/participants/${participantId}/inventories/${inventoryId}/items/${itemId}`,
    );
  }

  addInventoryForCharacter(
    gameInstanceId: string,
    participantId: string,
    inventory: AttributeInventory,
  ): Observable<Participant> {
    return this.http.post<Participant>(
      `${this.baseUrl}/game-instances/${gameInstanceId}/participants/${participantId}/inventories/add`,
      inventory,
    );
  }

  updateInventoryForCharacter(
    gameInstanceId: string,
    participantId: string,
    inventoryId: string,
    inventory: AttributeInventory,
  ): Observable<Participant> {
    return this.http.put<Participant>(
      `${this.baseUrl}/game-instances/${gameInstanceId}/participants/${participantId}/inventories/${inventoryId}/update`,
      inventory,
    );
  }

  deleteInventoryForCharacter(
    gameInstanceId: string,
    participantId: string,
    inventoryId: string,
  ): Observable<Participant> {
    return this.http.delete<Participant>(
      `${this.baseUrl}/game-instances/${gameInstanceId}/participants/${participantId}/inventories/${inventoryId}/delete`,
      {},
    );
  }

}
