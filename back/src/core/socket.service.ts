import { Server } from 'socket.io';
import { GameEventMongoClient } from '../features/gameevent/game-event.mongo-client';
import { EventBase } from '../pagemaster-schemas/src/events.types';
import { GameEvent, GameMaster, GameSession, Player } from '../pagemaster-schemas/src/pagemaster.types';
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
  }

  async notifyGameSessionUpdate(params: {
    gameSession: GameSession,
    by: Player | GameMaster,
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
      params.gameSession,
      params.by,
      params.event.type,
      params.event.title,
      params.event.description,
      params.event.metadata
    );
    
    // Notify via socket with the same event structure
    const roomName = RoomId(params.gameSession.id);
    this.io.to(roomName).emit(PageMasterSocketEvents.GAME_SESSION_UPDATED, { 
      gameSession: params.gameSession, 
      by: params.by,
      event: gameEvent 
    });
    this.logger.info(`Notified room ${roomName} of game session update`);
  }

  private async createGameEvent(
    gameSession: GameSession,
    participant: Player | GameMaster,
    type: string,
    title: string,
    description: string,
    metadata?: Record<string, unknown>
  ): Promise<GameEvent> {
    const event: GameEvent = {
      id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
      gameSessionId: gameSession.id,
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
        gameSessionId: gameSession.id
      });
    }
    
    return event;
  }
}