import { Request } from 'express';
import { LoggerService } from '../../core/logger.service';
import { Delete, Get, Post, Put } from '../../core/router/controller.decorators';
import { HttpForbiddenError } from '../../core/router/http-errors';
import { SocketServerService } from '../../core/socket.service';
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
}
