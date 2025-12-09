import { Request } from 'express';
import { LoggerService } from '../../core/logger.service';
import { Delete, Get, Post, Put } from '../../core/router/controller.decorators';
import { HttpForbiddenError } from '../../core/router/http-errors';
import { SocketServerService } from '../../core/socket.service';
import { AttributeBar, AttributeStatus } from '../../pagemaster-schemas/src/attributes.types';
import { GameSession, Player } from '../../pagemaster-schemas/src/pagemaster.types';
import { GameSessionMongoClient } from './game-session.mongo-client';
import { GameSessionService } from './game-session.service';

export class GameSessionController {
  private gameInstanceService: GameSessionService;

  constructor(
    private mongoClient: GameSessionMongoClient,
    socketServerService: SocketServerService,
    private logger: LoggerService,
  ) {
    this.gameInstanceService = new GameSessionService(mongoClient, socketServerService);
  }

  @Get('/game-sessions')
  public async getAllGameSessions(): Promise<GameSession[]> {
    const gameInstanceDocuments = await this.mongoClient.getAllGameSessions();
    
    // Convert MongoDB documents to plain GameSession objects (remove MongoDB _id field)
    return gameInstanceDocuments.map(doc => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, ...gameSession } = doc;
      return gameSession as GameSession;
    });
  }

  @Get('/game-sessions/:id')
  public async getGameInstanceById(body: unknown, params: {id: string}): Promise<GameSession | null> {
    const doc = await this.mongoClient.findGameSessionById(params.id);
    if (!doc) return null;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...gameSession } = doc;
    return gameSession as GameSession;
  }

  @Post('/game-sessions')
  public async createGameSession(gameSession: GameSession): Promise<GameSession> {
    gameSession.id = `game-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    gameSession.version = 0;
    const doc = await this.mongoClient.createGameSession(gameSession);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...createdGameSession } = doc;
    
    return createdGameSession as GameSession;
  }

  @Post('/game-sessions/:gameSessionId/participants')
  public async addParticipant(
    participant: Player,
    params: {gameSessionId: string},
    query: unknown,
    req: Request,
  ): Promise<GameSession> {
    const { gameSession, currentParticipant } = await this.gameInstanceService.validateContext(params.gameSessionId, req);

    // Add the new participant to the game instance
    gameSession.players = gameSession.players || [];
    gameSession.players.push(participant);

    const gameInstanceCleaned = await this.gameInstanceService.commitGameSession(gameSession);

    const updatedParticipant = this.gameInstanceService.getParticipant(currentParticipant.id, gameInstanceCleaned);
    if (!updatedParticipant) {
      throw new HttpForbiddenError('Forbidden: You are no longer a participant of this game instance');
    }
    
    this.gameInstanceService.notifyGameSessionUpdate({
      gameSession: gameInstanceCleaned,
      by: updatedParticipant,
      event: {
        type: 'participant-added',
        title: 'New participant added',
        description: `${currentParticipant.name} added a new participant: ${participant.name}`,
        metadata: { 
          participantId: participant.id,
          participantName: participant.name,
        }
      }
    });
    
    return gameInstanceCleaned;
  }

  @Put('/game-sessions/:id')
  public async updateGameSession(
    newGameSession: GameSession,
    params: {id: string},
    query: unknown,
    req: Request,
  ): Promise<GameSession> {
    const { currentParticipant } = await this.gameInstanceService.validateContext(params.id, req);
    const gameInstanceCleaned = await this.gameInstanceService.commitGameSession(newGameSession);

    const updatedParticipant = this.gameInstanceService.getParticipant(currentParticipant.id, gameInstanceCleaned);
    if (!updatedParticipant) {
      throw new HttpForbiddenError('Forbidden: You are no longer a participant of this game instance');
    }
    
    this.gameInstanceService.notifyGameSessionUpdate({
      gameSession: gameInstanceCleaned,
      by: updatedParticipant,
      event: {
        type: 'game-session-updated',
        title: 'Game instance updated',
        description: `${currentParticipant.name} updated the game instance`,
        metadata: { version: gameInstanceCleaned.version }
      }
    });
    
    return gameInstanceCleaned;
  }

  @Put('/game-sessions/:gameSessionId/participants/:participantId')
  public async updateParticipant(
    participant: Player,
    params: {gameSessionId: string, participantId: string},
    query: unknown,
    req: Request,
  ): Promise<GameSession> {
    const { gameSession, currentParticipant } = await this.gameInstanceService.validateContext(params.gameSessionId, req);

    const participantIndex = this.gameInstanceService.findParticipantIndex(gameSession, params.participantId);
    const oldParticipant = gameSession.players[participantIndex];
    gameSession.players[participantIndex] = participant;

    const gameInstanceCleaned = await this.gameInstanceService.commitGameSession(gameSession);

    const updatedParticipant = this.gameInstanceService.getParticipant(currentParticipant.id, gameInstanceCleaned);
    if (!updatedParticipant) {
      throw new HttpForbiddenError('Forbidden: You are no longer a participant of this game instance');
    }
    
    this.gameInstanceService.notifyGameSessionUpdate({
      gameSession: gameInstanceCleaned,
      by: updatedParticipant,
      event: {
        type: 'participant-updated',
        title: 'Participant updated',
        description: `${currentParticipant.name} updated participant: ${participant.name}`,
        metadata: { 
          updatedParticipantId: participant.id,
          updatedParticipantName: participant.name,
          oldName: oldParticipant.name
        }
      }
    });
    
    return gameInstanceCleaned;
  }

  @Delete('/game-sessions/:gameSessionId/participants/:participantId')
  public async deleteParticipant(
    body: unknown,
    params: {gameSessionId: string, participantId: string},
    query: unknown,
    req: Request,
  ): Promise<GameSession> {
    const { gameSession, currentParticipant } = await this.gameInstanceService.validateContext(params.gameSessionId, req);

    const participantIndex = this.gameInstanceService.findParticipantIndex(gameSession, params.participantId);
    const deletedParticipant = gameSession.players[participantIndex];
    
    // Remove the participant from the array
    gameSession.players.splice(participantIndex, 1);

    const gameInstanceCleaned = await this.gameInstanceService.commitGameSession(gameSession);

    const updatedParticipant = this.gameInstanceService.getParticipant(currentParticipant.id, gameInstanceCleaned);
    if (!updatedParticipant) {
      throw new HttpForbiddenError('Forbidden: You are no longer a participant of this game instance');
    }
    
    this.gameInstanceService.notifyGameSessionUpdate({
      gameSession: gameInstanceCleaned,
      by: updatedParticipant,
      event: {
        type: 'participant-deleted',
        title: 'Participant removed',
        description: `${currentParticipant.name} removed participant: ${deletedParticipant.name}`,
        metadata: { 
          deletedParticipantId: deletedParticipant.id,
          deletedParticipantName: deletedParticipant.name,
        }
      }
    });
    
    return gameInstanceCleaned;
  }

  @Delete('/game-sessions/:id')
  public async deleteGameSession(body: unknown, params: {id: string}): Promise<boolean> {
    return await this.mongoClient.deleteGameSession(params.id);
  }

  @Put('/game-sessions/:gameSessionId/quick-values/statuses')
  public async addQuickValueStatus(
    status: AttributeStatus,
    params: {gameSessionId: string},
    query: unknown,
    req: Request,
  ): Promise<GameSession> {
    const { gameSession, currentParticipant } = await this.gameInstanceService.validateContext(params.gameSessionId, req);

    // Initialize quickValues.statuses if it doesn't exist
    gameSession.quickValues = gameSession.quickValues || { statuses: [] };
    gameSession.quickValues.statuses = gameSession.quickValues.statuses || [];

    // Check if status with same ID already exists
    const existingIndex = gameSession.quickValues.statuses.findIndex(s => s.id === status.id);
    if (existingIndex !== -1) {
      // Update existing status
      gameSession.quickValues.statuses[existingIndex] = status;
    } else {
      // Add new status
      gameSession.quickValues.statuses.push(status);
    }

    const gameInstanceCleaned = await this.gameInstanceService.commitGameSession(gameSession);

    const updatedParticipant = this.gameInstanceService.getParticipant(currentParticipant.id, gameInstanceCleaned);
    if (!updatedParticipant) {
      throw new HttpForbiddenError('Forbidden: You are no longer a participant of this game instance');
    }
    
    this.gameInstanceService.notifyGameSessionUpdate({
      gameSession: gameInstanceCleaned,
      by: updatedParticipant,
      event: {
        type: 'game-session-updated',
        title: 'Quick value status added',
        description: `${currentParticipant.name} added status to quick values: ${status.name}`,
        metadata: { statusId: status.id, statusName: status.name }
      }
    });
    
    return gameInstanceCleaned;
  }

  @Delete('/game-sessions/:gameSessionId/quick-values/statuses/:statusId')
  public async deleteQuickValueStatus(
    body: unknown,
    params: {gameSessionId: string, statusId: string},
    query: unknown,
    req: Request,
  ): Promise<GameSession> {
    const { gameSession, currentParticipant } = await this.gameInstanceService.validateContext(params.gameSessionId, req);

    // Initialize quickValues.statuses if it doesn't exist
    gameSession.quickValues = gameSession.quickValues || { statuses: [] };
    gameSession.quickValues.statuses = gameSession.quickValues.statuses || [];

    const statusIndex = gameSession.quickValues.statuses.findIndex(s => s.id === params.statusId);
    if (statusIndex === -1) {
      throw new HttpForbiddenError(`Status with ID ${params.statusId} not found in quick values`);
    }

    const deletedStatus = gameSession.quickValues.statuses[statusIndex];
    gameSession.quickValues.statuses.splice(statusIndex, 1);

    const gameInstanceCleaned = await this.gameInstanceService.commitGameSession(gameSession);

    const updatedParticipant = this.gameInstanceService.getParticipant(currentParticipant.id, gameInstanceCleaned);
    if (!updatedParticipant) {
      throw new HttpForbiddenError('Forbidden: You are no longer a participant of this game instance');
    }
    
    this.gameInstanceService.notifyGameSessionUpdate({
      gameSession: gameInstanceCleaned,
      by: updatedParticipant,
      event: {
        type: 'game-session-updated',
        title: 'Quick value status deleted',
        description: `${currentParticipant.name} removed status from quick values: ${deletedStatus.name}`,
        metadata: { statusId: deletedStatus.id, statusName: deletedStatus.name }
      }
    });
    
    return gameInstanceCleaned;
  }

  @Put('/game-sessions/:gameSessionId/quick-values/bars')
  public async addQuickValueBar(
    bar: AttributeBar,
    params: {gameSessionId: string},
    query: unknown,
    req: Request,
  ): Promise<GameSession> {
    const { gameSession, currentParticipant } = await this.gameInstanceService.validateContext(params.gameSessionId, req);

    // Initialize quickValues.bars if it doesn't exist
    gameSession.quickValues = gameSession.quickValues || { statuses: [], bars: [] };
    gameSession.quickValues.bars = gameSession.quickValues.bars || [];

    // Check if bar with same ID already exists
    const existingIndex = gameSession.quickValues.bars.findIndex(b => b.id === bar.id);
    if (existingIndex !== -1) {
      // Update existing bar
      gameSession.quickValues.bars[existingIndex] = bar;
    } else {
      // Add new bar
      gameSession.quickValues.bars.push(bar);
    }

    const gameInstanceCleaned = await this.gameInstanceService.commitGameSession(gameSession);

    const updatedParticipant = this.gameInstanceService.getParticipant(currentParticipant.id, gameInstanceCleaned);
    if (!updatedParticipant) {
      throw new HttpForbiddenError('Forbidden: You are no longer a participant of this game instance');
    }
    
    this.gameInstanceService.notifyGameSessionUpdate({
      gameSession: gameInstanceCleaned,
      by: updatedParticipant,
      event: {
        type: 'game-session-updated',
        title: 'Quick value bar added',
        description: `${currentParticipant.name} added bar to quick values: ${bar.name}`,
        metadata: { barId: bar.id, barName: bar.name }
      }
    });
    
    return gameInstanceCleaned;
  }

  @Delete('/game-sessions/:gameSessionId/quick-values/bars/:barId')
  public async deleteQuickValueBar(
    body: unknown,
    params: {gameSessionId: string, barId: string},
    query: unknown,
    req: Request,
  ): Promise<GameSession> {
    const { gameSession, currentParticipant } = await this.gameInstanceService.validateContext(params.gameSessionId, req);

    // Initialize quickValues.bars if it doesn't exist
    gameSession.quickValues = gameSession.quickValues || { statuses: [], bars: [] };
    gameSession.quickValues.bars = gameSession.quickValues.bars || [];

    const barIndex = gameSession.quickValues.bars.findIndex(b => b.id === params.barId);
    if (barIndex === -1) {
      throw new HttpForbiddenError(`Bar with ID ${params.barId} not found in quick values`);
    }

    const deletedBar = gameSession.quickValues.bars[barIndex];
    gameSession.quickValues.bars.splice(barIndex, 1);

    const gameInstanceCleaned = await this.gameInstanceService.commitGameSession(gameSession);

    const updatedParticipant = this.gameInstanceService.getParticipant(currentParticipant.id, gameInstanceCleaned);
    if (!updatedParticipant) {
      throw new HttpForbiddenError('Forbidden: You are no longer a participant of this game instance');
    }
    
    this.gameInstanceService.notifyGameSessionUpdate({
      gameSession: gameInstanceCleaned,
      by: updatedParticipant,
      event: {
        type: 'game-session-updated',
        title: 'Quick value bar deleted',
        description: `${currentParticipant.name} removed bar from quick values: ${deletedBar.name}`,
        metadata: { barId: deletedBar.id, barName: deletedBar.name }
      }
    });
    
    return gameInstanceCleaned;
  }
}
