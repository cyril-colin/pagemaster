import { Request } from 'express';
import { Delete, Get, Post, Put } from '../../core/router/controller.decorators';
import { HttpForbiddenError, HttpNotFoundError } from '../../core/router/http-errors';
import { HEADER_CURRENT_PARTICIPANT } from '../../pagemaster-schemas/src/constants';
import { GameEvent } from '../../pagemaster-schemas/src/pagemaster.types';
import { GameInstanceMongoClient } from '../gameinstance/game-instance.mongo-client';
import { GameEventMongoClient } from './game-event.mongo-client';

export class GameEventController {
  constructor(
    private mongoClient: GameEventMongoClient,
    private gameInstanceMongoClient: GameInstanceMongoClient,
  ) {}

  @Get('/game-events')
  public async getAllGameEvents(): Promise<GameEvent[]> {
    const gameEventDocuments = await this.mongoClient.getAllGameEvents();
    
    // Convert MongoDB documents to plain GameEvent objects (remove MongoDB _id field)
    return gameEventDocuments.map(doc => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, ...gameEvent } = doc;
      return gameEvent as GameEvent;
    });
  }

  @Get('/game-events/:id')
  public async getGameEventById(body: unknown, params: {id: string}): Promise<GameEvent | null> {
    const doc = await this.mongoClient.findGameEventById(params.id);
    if (!doc) return null;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...gameEvent } = doc;
    return gameEvent as GameEvent;
  }

  @Get('/game-instances/:gameInstanceId/game-events')
  public async getGameEventsByGameInstanceId(body: unknown, params: {gameInstanceId: string}): Promise<GameEvent[]> {
    const gameEventDocuments = await this.mongoClient.findGameEventsByGameInstanceId(params.gameInstanceId);
    // Convert MongoDB documents to plain GameEvent objects (remove MongoDB _id field)
    return gameEventDocuments.map(doc => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, ...gameEvent } = doc;
      return gameEvent as GameEvent;
    });
  }

  @Post('/game-instances/:gameInstanceId/game-events')
  public async createGameEvent(
    gameEvent: Omit<GameEvent, 'id' | 'timestamp' | 'gameInstanceId'>,
    params: {gameInstanceId: string},
    query: unknown,
    req: Request,
  ): Promise<GameEvent> {
    // Validate that the game instance exists
    const gameInstance = await this.gameInstanceMongoClient.findGameInstanceById(params.gameInstanceId);
    if (!gameInstance) {
      throw new HttpNotFoundError('Game instance not found');
    }

    // Validate that the participant exists in this game instance
    const currentParticipantId = (Array.isArray(req.headers[HEADER_CURRENT_PARTICIPANT]) ? null : req.headers[HEADER_CURRENT_PARTICIPANT]) || null;
    const currentParticipant = gameInstance.participants.find(p => p.id === currentParticipantId);
    
    if (!currentParticipant) {
      throw new HttpForbiddenError('Forbidden: You need to be a participant of this game instance');
    }

    // Create the complete game event with generated fields
    const completeGameEvent: GameEvent = {
      ...gameEvent,
      id: `${params.gameInstanceId}-event-${Date.now()}`,
      gameInstanceId: params.gameInstanceId,
      timestamp: Date.now(),
    };

    const doc = await this.mongoClient.createGameEvent(completeGameEvent);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...createdGameEvent } = doc;
    return createdGameEvent as GameEvent;
  }

  @Put('/game-events/:id')
  public async updateGameEvent(
    gameEvent: Partial<GameEvent>,
    params: {id: string},
    query: unknown,
    req: Request,
  ): Promise<boolean> {
    // Find the existing event
    const existingEvent = await this.mongoClient.findGameEventById(params.id);
    if (!existingEvent) {
      throw new HttpNotFoundError('Game event not found');
    }

    // Validate that the game instance exists
    const gameInstance = await this.gameInstanceMongoClient.findGameInstanceById(existingEvent.gameInstanceId);
    if (!gameInstance) {
      throw new HttpNotFoundError('Game instance not found');
    }

    // Check if the current participant is the event owner or game master
    const currentParticipantId = (Array.isArray(req.headers[HEADER_CURRENT_PARTICIPANT]) ? null : req.headers[HEADER_CURRENT_PARTICIPANT]) || null;
    const currentParticipant = gameInstance.participants.find(p => p.id === currentParticipantId);
    
    if (!currentParticipant) {
      throw new HttpForbiddenError('Forbidden: You need to be a participant of this game instance');
    }

    if (currentParticipant.id !== existingEvent.participantId && currentParticipant.type !== 'gameMaster') {
      throw new HttpForbiddenError('Forbidden: You can only update your own events or must be a game master');
    }

    // Prevent updating certain immutable fields
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, gameInstanceId, timestamp, ...allowedUpdates } = gameEvent;

    const updated = await this.mongoClient.updateGameEvent(params.id, allowedUpdates);
    return updated;
  }

  @Delete('/game-events/:id')
  public async deleteGameEvent(
    body: unknown,
    params: {id: string},
    query: unknown,
    req: Request,
  ): Promise<boolean> {
    // Find the existing event
    const existingEvent = await this.mongoClient.findGameEventById(params.id);
    if (!existingEvent) {
      throw new HttpNotFoundError('Game event not found');
    }

    // Validate that the game instance exists
    const gameInstance = await this.gameInstanceMongoClient.findGameInstanceById(existingEvent.gameInstanceId);
    if (!gameInstance) {
      throw new HttpNotFoundError('Game instance not found');
    }

    // Check if the current participant is the event owner or game master
    const currentParticipantId = (Array.isArray(req.headers[HEADER_CURRENT_PARTICIPANT]) ? null : req.headers[HEADER_CURRENT_PARTICIPANT]) || null;
    const currentParticipant = gameInstance.participants.find(p => p.id === currentParticipantId);
    
    if (!currentParticipant) {
      throw new HttpForbiddenError('Forbidden: You need to be a participant of this game instance');
    }

    if (currentParticipant.id !== existingEvent.participantId && currentParticipant.type !== 'gameMaster') {
      throw new HttpForbiddenError('Forbidden: You can only delete your own events or must be a game master');
    }

    return await this.mongoClient.deleteGameEvent(params.id);
  }
}
