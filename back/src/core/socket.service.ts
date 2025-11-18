import { Server } from 'socket.io';
import { EventBase } from '../pagemaster-schemas/src/events.types';
import { PageMasterSocketEvents, RoomId } from '../pagemaster-schemas/src/socket-events.types';
import { LoggerService } from './logger.service';

export class SocketServerService {
  private io: Server | null = null;

  constructor(
    private logger: LoggerService,
  ) {}


  public init(io: Server) {
    this.io = io;
    this.io.on('connection', (socket) => {
      this.logger.info('New client connected:', socket.id);

      socket.on(PageMasterSocketEvents.JOIN_GAME_SESSION, ({ gameSessionId, participantId }) => {
        const roomName = RoomId(gameSessionId);
        socket.join(roomName);
        this.logger.info(`Participant ${participantId} joined room: ${roomName}`);
        socket.emit(PageMasterSocketEvents.JOINED_GAME_SESSION, { gameSessionId, participantId });
      });

      socket.on(PageMasterSocketEvents.LEAVE_GAME_SESSION, ({ gameSessionId }) => {
        const roomName = RoomId(gameSessionId);
        socket.leave(roomName);
        socket.emit(PageMasterSocketEvents.LEFT_GAME_SESSION, { gameSessionId });
        this.logger.info(`Client ${socket.id} left room: ${roomName}`);
      });

      socket.on('disconnect', () => {
        this.logger.info('Client disconnected:', socket.id);
      });
    });
  }

  public async notifySessionUpdate(event: EventBase) {
    if (!this.io) {
      throw new Error('SocketServerService not initialized');
    }

    const roomName = RoomId(event.gameSessionId);
    this.io.to(roomName).emit(PageMasterSocketEvents.GAME_SESSION_UPDATED, event);
    this.logger.info(`Notified room ${roomName} of game session update`);
  }
}