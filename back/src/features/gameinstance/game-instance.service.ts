import { Request } from 'express';
import { HttpBadRequestError, HttpForbiddenError, HttpNotFoundError } from '../../core/router/http-errors';
import { SocketServerService } from '../../core/socket.service';
import { HEADER_CURRENT_PARTICIPANT } from '../../pagemaster-schemas/src/constants';
import { GameInstance, Participant } from '../../pagemaster-schemas/src/pagemaster.types';
import { GameInstanceMongoClient } from './game-instance.mongo-client';

export class GameInstanceService {
  constructor(
    private mongoClient: GameInstanceMongoClient,
    private socketServerService: SocketServerService,
  ) {}

  public async validateContext(
    gameInstanceId: string,
    req: Request,
    requiredRole: Participant['type'],
  ): Promise<{gameInstance: GameInstance, currentParticipant: Participant}> {
    if (!gameInstanceId) {
      throw new HttpBadRequestError('Missing gameInstanceId parameter');
    }
    const gameInstance = await this.mongoClient.findGameInstanceById(gameInstanceId);
    if (!gameInstance) {
      throw new HttpNotFoundError('Game instance not found');
    }

    const currentParticipantId = (Array.isArray(req.headers[HEADER_CURRENT_PARTICIPANT]) ? null : req.headers[HEADER_CURRENT_PARTICIPANT]) || null;
    const currentParticipant = this.getParticipant(currentParticipantId, gameInstance);
    if (requiredRole === 'gameMaster' && currentParticipant?.type !== 'gameMaster') {
      throw new HttpForbiddenError('Forbidden: You need to be a game master');
    }
    if (!currentParticipant) {
      throw new HttpForbiddenError('Forbidden: You need to be a player');
    }

    return { gameInstance, currentParticipant };
  }

  public async commitGameInstance(gameInstance: GameInstance): Promise<GameInstance> {
    gameInstance.version = (gameInstance.version || 0) + 1;
    const updated = await this.mongoClient.updateGameInstance(gameInstance.id, gameInstance.version -1, gameInstance);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...gameInstanceCleaned } = updated as GameInstance & {_id: unknown};
    return gameInstanceCleaned;
  }

  public getParticipant(participantId: Participant['id'] |null, gameInstance: GameInstance): Participant | null {
    const currentParticipant = gameInstance.participants.find(p => p.id === participantId);
    return currentParticipant || null;
  }

  public validateParticipantPermission(currentParticipant: Participant, participantId: string): void {
    if ((currentParticipant.id !== participantId && currentParticipant.type !== 'gameMaster')) {
      throw new HttpForbiddenError('Forbidden: You can only update your own participant data');
    }
  }

  public findParticipantIndex(gameInstance: GameInstance, participantId: string): number {
    const participantIndex = gameInstance.participants.findIndex(p => p.id === participantId);
    if (participantIndex === -1) {
      throw new HttpBadRequestError('Participant not found in the specified game instance');
    }
    return participantIndex;
  }

  public validatePlayerType(participant: Participant): asserts participant is Participant & {type: 'player'} {
    if (participant.type !== 'player') {
      throw new HttpForbiddenError('Forbidden: Only players can have this property updated');
    }
  }

  public notifyGameInstanceUpdate(params: {
    gameInstance: GameInstance,
    by: Participant,
    event: {
      type: string,
      title: string,
      description: string,
      metadata?: Record<string, unknown>
    }
  }): void {
    this.socketServerService.notifyGameInstanceUpdate(params);
  }
}
