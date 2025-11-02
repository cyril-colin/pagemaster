import { Request } from 'express';
import { Patch } from '../../core/router/controller.decorators';
import { HttpForbiddenError } from '../../core/router/http-errors';
import { Character, GameInstance } from '../../pagemaster-schemas/src/pagemaster.types';
import { GameInstanceService } from './game-instance.service';

export class ParticipantStrengthsController {
  constructor(private gameInstanceService: GameInstanceService) {}
  @Patch('/game-instances/:gameInstanceId/participants/:participantId/strengths')
  public async updateParticipantStrengths(
    attributes: Pick<Character['attributes'], 'strength'>,
    params: {gameInstanceId: string, participantId: string},
    query: unknown,
    req: Request,
  ): Promise<GameInstance> {
    const { gameInstance, currentParticipant } = await this.gameInstanceService.validateContext(params.gameInstanceId, req, 'player');
    this.gameInstanceService.validateParticipantPermission(currentParticipant, params.participantId);

    const participantIndex = this.gameInstanceService.findParticipantIndex(gameInstance, params.participantId);
    const player = gameInstance.participants[participantIndex];
    this.gameInstanceService.validatePlayerType(player);

    player.character.attributes.strength = attributes.strength;

    const gameInstanceCleaned = await this.gameInstanceService.commitGameInstance(gameInstance);

    const updatedParticipant = this.gameInstanceService.getParticipant(currentParticipant.id, gameInstanceCleaned);
    if (!updatedParticipant) {
      throw new HttpForbiddenError('Forbidden: You are no longer a participant of this game instance');
    }
    
    this.gameInstanceService.notifyGameInstanceUpdate({
      gameInstance: gameInstanceCleaned,
      by: updatedParticipant,
      event: {
        type: 'participant-strengths-update',
        title: 'Strengths Updated',
        description: `${currentParticipant.name} updated strengths of ${player.character.name}`,
      }
    });
    
    return gameInstanceCleaned;
  }
}
