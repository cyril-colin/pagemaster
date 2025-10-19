import { Injectable } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { io } from 'socket.io-client';
import { PageMasterSocketEvents, PageMasterSocketEventsPayloads } from '@pagemaster/common/socket-events.types';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket = io('http://localhost:8080', {autoConnect: false});
  

  connect(): void {
    if (!this.socket.connected) {
      this.socket.connect();
    }
  }

  disconnect(): void {
    if (this.socket.connected) {
      this.socket.disconnect();
    }
  }


  emit<T extends PageMasterSocketEvents>(event: T, payload: PageMasterSocketEventsPayloads[T]): void {
    this.socket.emit(event, payload);
  }

  listen<T extends PageMasterSocketEvents>(event: T): Observable<PageMasterSocketEventsPayloads[T]> {
    return fromEvent<PageMasterSocketEventsPayloads[T]>(this.socket, event);
  }
}