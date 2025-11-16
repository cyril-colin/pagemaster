import { Request } from 'express';
import { EventBase } from 'src/pagemaster-schemas/src/events.types';
import { Delete, Get, Post, Put } from '../../core/router/controller.decorators';
import { HttpBadRequestError, HttpForbiddenError, HttpNotFoundError } from '../../core/router/http-errors';
import { HEADER_CURRENT_PARTICIPANT } from '../../pagemaster-schemas/src/constants';
import { EventCharacterTypes } from '../../pagemaster-schemas/src/events-character.types';
import { GameEvent } from '../../pagemaster-schemas/src/pagemaster.types';
import { EventCharacterExecuter } from '../event-executer/event-character/event-character.executer';
import { GameEventExecuter } from '../event-executer/event-executer';
import { GameSessionMongoClient } from '../gamesession/game-session.mongo-client';
import { GameEventMongoClient } from './game-event.mongo-client';

const CHARACTER_EVENT_TYPES = new Set<EventCharacterTypes>([
  EventCharacterTypes.CHARACTER_INVENTORY_DELETE,
  EventCharacterTypes.CHARACTER_INVENTORY_ADD,
  EventCharacterTypes.CHARACTER_INVENTORY_UPDATE,
  EventCharacterTypes.CHARACTER_INVENTORY_ITEM_ADD,
  EventCharacterTypes.CHARACTER_INVENTORY_ITEM_EDIT,
  EventCharacterTypes.CHARACTER_INVENTORY_ITEM_DELETE,
  EventCharacterTypes.CHARACTER_NAME_EDIT,
  EventCharacterTypes.CHARACTER_DESCRIPTION_EDIT,
]);

export class GameEventController {
  constructor(
    private mongoClient: GameEventMongoClient,
    private gameInstanceMongoClient: GameSessionMongoClient,
    private characterEventExecuter: EventCharacterExecuter,
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

  @Get('/game-sessions/:gameSessionId/game-events')
  public async getGameEventsByGameInstanceId(body: unknown, params: {gameSessionId: string}): Promise<GameEvent[]> {
    const gameEventDocuments = await this.mongoClient.findGameEventsByGameSessionId(params.gameSessionId);
    // Convert MongoDB documents to plain GameEvent objects (remove MongoDB _id field)
    return gameEventDocuments.map(doc => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, ...gameEvent } = doc;
      return gameEvent as GameEvent;
    });
  }

  @Post('/game-sessions/:gameSessionId/game-events/command')
  public async createCommandGameEvent(
    gameEvent: EventBase,
    params: {gameSessionId: string},
    query: unknown,
    req: Request,
  ): Promise<EventBase> {
    const gameSession = await this.gameInstanceMongoClient.findGameSessionById(params.gameSessionId);
    if (!gameSession) {
      throw new HttpNotFoundError('Game session not found');
    }
    const currentParticipantId = (Array.isArray(req.headers[HEADER_CURRENT_PARTICIPANT]) ? null : req.headers[HEADER_CURRENT_PARTICIPANT]) || null;
    const triggerer = gameSession.participants.find(p => p.id === currentParticipantId);
    if (!triggerer) {
      throw new HttpForbiddenError('Forbidden: You need to be a participant of this game session');
    }


    const executer = this.getExecuter(gameEvent);
    const res = await executer.executeEvent(gameEvent, triggerer, gameSession);
    return res;
  }

  protected getExecuter(gameEvent: EventBase,): GameEventExecuter {
    if (CHARACTER_EVENT_TYPES.has(gameEvent.type as EventCharacterTypes)) {
      return this.characterEventExecuter;
    }
    
    throw new HttpBadRequestError(`Unsupported event type: ${gameEvent.type}`);
  }

  @Post('/game-sessions/:gameSessionId/game-events')
  public async createGameEvent(
    gameEvent: Omit<GameEvent, 'id' | 'timestamp' | 'gameSessionId'>,
    params: {gameSessionId: string},
    query: unknown,
    req: Request,
  ): Promise<GameEvent> {
    // Validate that the game instance exists
    const gameSession = await this.gameInstanceMongoClient.findGameSessionById(params.gameSessionId);
    if (!gameSession) {
      throw new HttpNotFoundError('Game instance not found');
    }

    // Validate that the participant exists in this game instance
    const currentParticipantId = (Array.isArray(req.headers[HEADER_CURRENT_PARTICIPANT]) ? null : req.headers[HEADER_CURRENT_PARTICIPANT]) || null;
    const currentParticipant = gameSession.participants.find(p => p.id === currentParticipantId);
    
    if (!currentParticipant) {
      throw new HttpForbiddenError('Forbidden: You need to be a participant of this game instance');
    }

    // Create the complete game event with generated fields
    const completeGameEvent: GameEvent = {
      ...gameEvent,
      id: `${params.gameSessionId}-event-${Date.now()}`,
      gameSessionId: params.gameSessionId,
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
    const gameSession = await this.gameInstanceMongoClient.findGameSessionById(existingEvent.gameSessionId);
    if (!gameSession) {
      throw new HttpNotFoundError('Game instance not found');
    }

    // Check if the current participant is the event owner or game master
    const currentParticipantId = (Array.isArray(req.headers[HEADER_CURRENT_PARTICIPANT]) ? null : req.headers[HEADER_CURRENT_PARTICIPANT]) || null;
    const currentParticipant = gameSession.participants.find(p => p.id === currentParticipantId);
    
    if (!currentParticipant) {
      throw new HttpForbiddenError('Forbidden: You need to be a participant of this game instance');
    }

    if (currentParticipant.id !== existingEvent.participantId && currentParticipant.type !== 'gameMaster') {
      throw new HttpForbiddenError('Forbidden: You can only update your own events or must be a game master');
    }

    // Prevent updating certain immutable fields
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, gameSessionId, timestamp, ...allowedUpdates } = gameEvent;

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
    const gameSession = await this.gameInstanceMongoClient.findGameSessionById(existingEvent.gameSessionId);
    if (!gameSession) {
      throw new HttpNotFoundError('Game instance not found');
    }

    // Check if the current participant is the event owner or game master
    const currentParticipantId = (Array.isArray(req.headers[HEADER_CURRENT_PARTICIPANT]) ? null : req.headers[HEADER_CURRENT_PARTICIPANT]) || null;
    const currentParticipant = gameSession.participants.find(p => p.id === currentParticipantId);
    
    if (!currentParticipant) {
      throw new HttpForbiddenError('Forbidden: You need to be a participant of this game instance');
    }

    if (currentParticipant.id !== existingEvent.participantId && currentParticipant.type !== 'gameMaster') {
      throw new HttpForbiddenError('Forbidden: You can only delete your own events or must be a game master');
    }

    return await this.mongoClient.deleteGameEvent(params.id);
  }
}
