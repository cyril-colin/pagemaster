import { Server } from 'socket.io';
import { GameInstance, Participant } from '../pagemaster-schemas/src/pagemaster.types';
import { PageMasterSocketEvents, RoomId } from '../pagemaster-schemas/src/socket-events.types';
import { LoggerService } from './logger.service';

export class SocketServerService {
  private io: Server | null = null;

  constructor(private logger: LoggerService) {}


  public init(io: Server) {
    this.io = io;
    this.io.on('connection', (socket) => {
      this.logger.info('New client connected:', socket.id);

      socket.on(PageMasterSocketEvents.JOIN_GAME_INSTANCE, ({ gameInstanceId, participantId }) => {
        const roomName = RoomId(gameInstanceId);
        socket.join(roomName);
        this.logger.info(`Participant ${participantId} joined room: ${roomName}`);
        socket.emit(PageMasterSocketEvents.JOINED_GAME_INSTANCE, { gameInstanceId, participantId });
      });

      socket.on(PageMasterSocketEvents.LEAVE_GAME_INSTANCE, ({ gameInstanceId }) => {
        const roomName = `gameInstance_${gameInstanceId}`;
        socket.leave(roomName);
        socket.emit(PageMasterSocketEvents.LEFT_GAME_INSTANCE, { gameInstanceId });
        this.logger.info(`Client ${socket.id} left room: ${roomName}`);
      });

      socket.on('disconnect', () => {
        this.logger.info('Client disconnected:', socket.id);
      });
    });
  }

  notifyGameInstanceUpdate(gameInstance: GameInstance, by: Participant) {
    if (!this.io) {
      throw new Error('SocketServerService not initialized');
    }
    const roomName = RoomId(gameInstance.id);
    this.io.to(roomName).emit(PageMasterSocketEvents.GAME_INSTANCE_UPDATED, { gameInstance, by });
    this.logger.info(`Notified room ${roomName} of game instance update`);
  }
}