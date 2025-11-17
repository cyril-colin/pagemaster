import { Request } from 'express';
import { Delete, Patch, Post, Put } from '../../core/router/controller.decorators';
import { HttpForbiddenError } from '../../core/router/http-errors';
import { AttributeBar } from '../../pagemaster-schemas/src/attributes.types';
import { GameSession, Player } from '../../pagemaster-schemas/src/pagemaster.types';
import { GameSessionService } from './game-session.service';

export class ParticipantBarsController {
  constructor(private gameInstanceService: GameSessionService) {}

  @Patch('/game-sessions/:gameSessionId/participants/:participantId/bars')
  public async updateParticipantBars(
    attributes: Pick<Player['attributes'], 'bar'>,
    params: {gameSessionId: string, participantId: string},
    query: unknown,
    req: Request,
  ): Promise<GameSession> {
    const { gameSession, currentParticipant } = await this.gameInstanceService.validateContext(params.gameSessionId, req);

    const participantIndex = this.gameInstanceService.findParticipantIndex(gameSession, params.participantId);
    const player = gameSession.players[participantIndex];

    player.attributes.bar = attributes.bar;

    const gameInstanceCleaned = await this.gameInstanceService.commitGameSession(gameSession);

    const updatedParticipant = this.gameInstanceService.getParticipant(currentParticipant.id, gameInstanceCleaned);
    if (!updatedParticipant) {
      throw new HttpForbiddenError('Forbidden: You are no longer a participant of this game instance');
    }
    
    this.gameInstanceService.notifyGameSessionUpdate({
      gameSession: gameInstanceCleaned,
      by: updatedParticipant,
      event: {
        type: 'participant-bars-update',
        title: 'Bars Updated',
        description: `${currentParticipant.name} updated bars of ${player.name}`,
      }
    });
    
    return gameInstanceCleaned;
  }

  @Post('/game-sessions/:gameSessionId/participants/:participantId/bars')
  public async addParticipantBar(
    bar: AttributeBar,
    params: {gameSessionId: string, participantId: string},
    query: unknown,
    req: Request,
  ): Promise<GameSession> {
    const { gameSession, currentParticipant } = await this.gameInstanceService.validateContext(params.gameSessionId, req);

    const participantIndex = this.gameInstanceService.findParticipantIndex(gameSession, params.participantId);
    const player = gameSession.players[participantIndex];
    // Add the new bar
    bar.id = `bar-${bar.name}-${Date.now()}`;
    player.attributes.bar.push(bar);

    const gameInstanceCleaned = await this.gameInstanceService.commitGameSession(gameSession);

    const updatedParticipant = this.gameInstanceService.getParticipant(currentParticipant.id, gameInstanceCleaned);
    if (!updatedParticipant) {
      throw new HttpForbiddenError('Forbidden: You are no longer a participant of this game instance');
    }
    
    this.gameInstanceService.notifyGameSessionUpdate({
      gameSession: gameInstanceCleaned,
      by: updatedParticipant,
      event: {
        type: 'participant-bar-add',
        title: 'Bar Added',
        description: `${currentParticipant.name} added bar "${bar.name}" to ${player.name}`,
      }
    });
    
    return gameInstanceCleaned;
  }

  @Put('/game-sessions/:gameSessionId/participants/:participantId/bars/:barId')
  public async updateParticipantBar(
    bar: AttributeBar,
    params: {gameSessionId: string, participantId: string, barId: string},
    query: unknown,
    req: Request,
  ): Promise<GameSession> {
    const { gameSession, currentParticipant } = await this.gameInstanceService.validateContext(params.gameSessionId, req);

    const participantIndex = this.gameInstanceService.findParticipantIndex(gameSession, params.participantId);
    const player = gameSession.players[participantIndex];

    // Find and update the bar
    const barIndex = player.attributes.bar.findIndex(b => b.id === params.barId);
    if (barIndex === -1) {
      throw new HttpForbiddenError(`Bar with id ${params.barId} not found`);
    }

    player.attributes.bar[barIndex] = bar;

    const gameInstanceCleaned = await this.gameInstanceService.commitGameSession(gameSession);

    const updatedParticipant = this.gameInstanceService.getParticipant(currentParticipant.id, gameInstanceCleaned);
    if (!updatedParticipant) {
      throw new HttpForbiddenError('Forbidden: You are no longer a participant of this game instance');
    }
    
    this.gameInstanceService.notifyGameSessionUpdate({
      gameSession: gameInstanceCleaned,
      by: updatedParticipant,
      event: {
        type: 'participant-bar-update',
        title: 'Bar Updated',
        description: `${currentParticipant.name} updated bar "${bar.name}" for ${player.name}`,
      }
    });
    
    return gameInstanceCleaned;
  }

  @Delete('/game-sessions/:gameSessionId/participants/:participantId/bars/:barId')
  public async deleteParticipantBar(
    body: unknown,
    params: {gameSessionId: string, participantId: string, barId: string},
    query: unknown,
    req: Request,
  ): Promise<GameSession> {
    const { gameSession, currentParticipant } = await this.gameInstanceService.validateContext(params.gameSessionId, req);


    const participantIndex = this.gameInstanceService.findParticipantIndex(gameSession, params.participantId);
    const player = gameSession.players[participantIndex];

    // Find and remove the bar
    const barIndex = player.attributes.bar.findIndex(b => b.id === params.barId);
    if (barIndex === -1) {
      throw new HttpForbiddenError(`Bar with id ${params.barId} not found`);
    }

    const deletedBar = player.attributes.bar[barIndex];
    player.attributes.bar.splice(barIndex, 1);

    const gameInstanceCleaned = await this.gameInstanceService.commitGameSession(gameSession);

    const updatedParticipant = this.gameInstanceService.getParticipant(currentParticipant.id, gameInstanceCleaned);
    if (!updatedParticipant) {
      throw new HttpForbiddenError('Forbidden: You are no longer a participant of this game instance');
    }
    
    this.gameInstanceService.notifyGameSessionUpdate({
      gameSession: gameInstanceCleaned,
      by: updatedParticipant,
      event: {
        type: 'participant-bar-delete',
        title: 'Bar Deleted',
        description: `${currentParticipant.name} deleted bar "${deletedBar.name}" from ${player.name}`,
      }
    });
    
    return gameInstanceCleaned;
  }
}
