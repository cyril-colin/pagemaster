import { Request } from 'express';
import { GameSession } from 'src/pagemaster-schemas/src/pagemaster.types';
import { Get, Post } from '../../core/router/controller.decorators';
import { HttpBadRequestError, HttpNotFoundError } from '../../core/router/http-errors';
import { SocketServerService } from '../../core/socket.service';
import { HEADER_CURRENT_PARTICIPANT } from '../../pagemaster-schemas/src/constants';
import { EventPlayerLootBoxItemClaimed, EventPlayerTypes, isEventPlayerType } from '../../pagemaster-schemas/src/events-player.types';
import { EventBase, EventLootBox } from '../../pagemaster-schemas/src/events.types';
import { GameSessionMongoClient } from '../gamesession/game-session.mongo-client';
import { EventDiceRollExecuter } from './event-executer/event-dice-roll.executer';
import { GameEventExecuter } from './event-executer/event-executer';
import { EventLootBoxExecuter } from './event-executer/event-loot-box.executer';
import { EventPlayerExecuter } from './event-executer/event-player/event-player.executer';
import { GameEventMongoClient } from './game-event.mongo-client';

export class GameEventController {
  constructor(
    private gameInstanceMongoClient: GameSessionMongoClient,
    private gameEventMongoClient: GameEventMongoClient,
    private socketServerService: SocketServerService,
  ) {}

  @Get('/game-events/:gameSessionId')
  public async getAllGameEvents(body: unknown, params: { gameSessionId: string }): Promise<EventBase[]> {
    const gameEventDocuments = await this.gameEventMongoClient.getEventsByGameSessionId(params.gameSessionId);
    return gameEventDocuments.map(doc => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, ...gameEvent } = doc;
      return gameEvent as EventBase;
    });
  }

  @Post('/game-events/command')
  public async createCommandGameEvent(
    gameEvent: EventBase,
    params: unknown,
    query: unknown,
    req: Request,
  ): Promise<EventBase> {
    const gameSession = await this.gameInstanceMongoClient.findGameSessionById(gameEvent.gameSessionId);
    if (!gameSession) {
      throw new HttpNotFoundError('Game session not found');
    }
    const currentParticipantId = (Array.isArray(req.headers[HEADER_CURRENT_PARTICIPANT]) ? null : req.headers[HEADER_CURRENT_PARTICIPANT]) || null;


    const executer = this.getExecuter(gameEvent);
    const res = await executer.executeEvent(gameEvent, gameSession.master, gameSession, currentParticipantId);

    // Special handling for loot box item claims
    if (gameEvent.type === EventPlayerTypes.PLAYER_LOOT_BOX_ITEM_CLAIMED) {
      await this.handleLootBoxItemClaim(res.event as EventPlayerLootBoxItemClaimed, res.newGameSession);
    }

    await this.gameInstanceMongoClient.updateGameSession(res.newGameSession.id, res.newGameSession.version || 0, res.newGameSession);
    await this.socketServerService.notifySessionUpdate(res.newGameSession, res.event);
    await this.gameEventMongoClient.createEvent(res.event);
    return res.event;
  }

  private async handleLootBoxItemClaim(claimEvent: EventPlayerLootBoxItemClaimed, gameSession: GameSession) {
    // Find the original loot box event
    const lootBoxEvent = await this.gameEventMongoClient.findEventById(claimEvent.lootBoxEventId);
    if (!lootBoxEvent || lootBoxEvent.type !== 'loot-box') {
      throw new HttpNotFoundError('Loot box event not found');
    }

    const lootBoxData = lootBoxEvent as unknown as EventLootBox;
    const lootBoxItem = lootBoxData.lootBox.items.find(item => item.item.id === claimEvent.itemId);
    
    if (!lootBoxItem) {
      throw new HttpBadRequestError('Item not found in loot box');
    }

    if (lootBoxItem.claimedByPlayerId !== null) {
      throw new HttpBadRequestError('Item has already been claimed');
    }

    // Find the player and their first eligible inventory
    const player = gameSession.players.find((p: { id: string }) => p.id === claimEvent.playerId);
    if (!player) {
      throw new HttpNotFoundError('Player not found');
    }

    const inventory = player.attributes.inventory.find((inv: { isSecret: boolean; capacity: { type: string } }) => 
      !inv.isSecret && 
      inv.capacity.type === 'weight'
    );

    if (!inventory) {
      throw new HttpBadRequestError('Player has no available inventory');
    }

    // Add item to player's inventory
    inventory.current.push(lootBoxItem.item);

    // Update the loot box event to mark the item as claimed
    lootBoxItem.claimedByPlayerId = claimEvent.playerId;
    await this.gameEventMongoClient.updateEvent(claimEvent.lootBoxEventId, {
      lootBox: lootBoxData.lootBox,
    } as Partial<EventBase>);

    // Broadcast the updated loot box event to all clients
    await this.socketServerService.notifySessionUpdate(gameSession, lootBoxData);
  }

  protected getExecuter(gameEvent: EventBase): GameEventExecuter {
    if (isEventPlayerType(gameEvent.type)) {
      return new EventPlayerExecuter();
    }
    if (gameEvent.type === 'dice-roll') {
      return new EventDiceRollExecuter();
    }
    if (gameEvent.type === 'loot-box') {
      return new EventLootBoxExecuter();
    }
    throw new HttpBadRequestError(`Unsupported event type: ${gameEvent.type}`);
  }
}
