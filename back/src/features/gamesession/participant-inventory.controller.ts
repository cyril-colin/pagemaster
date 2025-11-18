import { Request } from 'express';
import { Patch } from '../../core/router/controller.decorators';
import { HttpForbiddenError } from '../../core/router/http-errors';
import { GameMaster, GameSession, Player } from '../../pagemaster-schemas/src/pagemaster.types';
import { GameSessionService } from './game-session.service';

export class ParticipantInventoryController {
  constructor(private gameInstanceService: GameSessionService) {}

  private async setupInventoryOperation(
    gameSessionId: string,
    participantId: string,
    req: Request
  ) {
    const { gameSession, currentParticipant } = await this.gameInstanceService.validateContext(
      gameSessionId,
      req,
    );

    const participantIndex = this.gameInstanceService.findParticipantIndex(gameSession, participantId);
    const player = gameSession.players[participantIndex];

    return { gameSession, currentParticipant, player, participantIndex };
  }

  private async finalizeOperation(
    gameSession: GameSession,
    currentParticipant: Player | GameMaster,
    event: { type: string; title: string; description: string; metadata?: Record<string, unknown> }
  ) {
    const gameInstanceCleaned = await this.gameInstanceService.commitGameSession(gameSession);

    const updatedParticipant = this.gameInstanceService.getParticipant(
      currentParticipant.id,
      gameInstanceCleaned
    );
    if (!updatedParticipant) {
      throw new HttpForbiddenError('Forbidden: You are no longer a participant of this game instance');
    }

    this.gameInstanceService.notifyGameSessionUpdate({
      gameSession: gameInstanceCleaned,
      by: updatedParticipant,
      event
    });

    return gameInstanceCleaned;
  }

  @Patch('/game-sessions/:gameSessionId/participants/:participantId/inventories')
  public async updateParticipantInventories(
    attributes: Pick<Player['attributes'], 'inventory'>,
    params: {gameSessionId: string, participantId: string},
    query: unknown,
    req: Request,
  ): Promise<GameSession> {
    const { gameSession, currentParticipant, player } = await this.setupInventoryOperation(
      params.gameSessionId,
      params.participantId,
      req
    );

    player.attributes.inventory = attributes.inventory;

    return this.finalizeOperation(gameSession, currentParticipant, {
      type: 'participant-inventories-update',
      title: 'Inventories Updated',
      description: `${currentParticipant.name} updated inventories of ${player.name}`,
    });
  }
}
