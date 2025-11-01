import { Server } from 'socket.io';
import { GameEventMongoClient } from '../features/gameevent/game-event.mongo-client';
import { GameEvent, GameInstance, Participant } from '../pagemaster-schemas/src/pagemaster.types';
import { PageMasterSocketEvents, RoomId } from '../pagemaster-schemas/src/socket-events.types';
import { LoggerService } from './logger.service';

export class SocketServerService {
  private io: Server | null = null;

  constructor(
    private logger: LoggerService,
    private gameEventMongoClient: GameEventMongoClient,
  ) {}


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

  async notifyGameInstanceUpdate(params: {
    gameInstance: GameInstance,
    by: Participant,
    event: {
      type: string,
      title: string,
      description: string,
      metadata?: Record<string, unknown>
    }
  }) {
    if (!this.io) {
      throw new Error('SocketServerService not initialized');
    }
    
    // Create game event
    const gameEvent = await this.createGameEvent(
      params.gameInstance,
      params.by,
      params.event.type,
      params.event.title,
      params.event.description,
      params.event.metadata
    );
    
    // Notify via socket with the same event structure
    const roomName = RoomId(params.gameInstance.id);
    this.io.to(roomName).emit(PageMasterSocketEvents.GAME_INSTANCE_UPDATED, { 
      gameInstance: params.gameInstance, 
      by: params.by,
      event: gameEvent 
    });
    this.logger.info(`Notified room ${roomName} of game instance update`);
  }

  private async createGameEvent(
    gameInstance: GameInstance,
    participant: Participant,
    type: string,
    title: string,
    description: string,
    metadata?: Record<string, unknown>
  ): Promise<GameEvent> {
    const event: GameEvent = {
      id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
      gameInstanceId: gameInstance.id,
      type,
      participantId: participant.id,
      participantName: participant.name,
      title,
      description,
      timestamp: Date.now(),
      metadata
    };

    try {
      await this.gameEventMongoClient.createGameEvent(event);
    } catch (error) {
      // Log error but don't fail the main operation
      this.logger.error('Failed to create game event', { 
        error: error instanceof Error ? error.message : String(error),
        eventType: type,
        gameInstanceId: gameInstance.id
      });
    }
    
    return event;
  }
}