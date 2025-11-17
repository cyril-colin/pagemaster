import { Request } from 'express';
import { AttributeInventory } from 'src/pagemaster-schemas/src/attributes.types';
import { Delete, Patch, Post, Put } from '../../core/router/controller.decorators';
import { HttpBadRequestError, HttpForbiddenError } from '../../core/router/http-errors';
import { Item } from '../../pagemaster-schemas/src/items.types';
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

  private findInventory(player: Player, inventoryId: string) {
    const inventoryIndex = player.attributes.inventory.findIndex(
      inv => inv.id === inventoryId
    );
    if (inventoryIndex === -1) {
      throw new HttpBadRequestError('Inventory not found for the specified participant');
    }
    return { inventoryIndex, inventory: player.attributes.inventory[inventoryIndex] };
  }

  private findItem(inventory: Player['attributes']['inventory'][0], itemId: string) {
    const itemIndex = inventory.current.findIndex(i => i.id === itemId);
    if (itemIndex === -1) {
      throw new HttpBadRequestError('Item not found in the specified inventory');
    }
    return { itemIndex, item: inventory.current[itemIndex] };
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

  @Post('/game-sessions/:gameSessionId/participants/:participantId/inventories/:inventoryId/items')
  public async addItemToInventory(
    item: Item,
    params: {gameSessionId: string, participantId: string, inventoryId: string},
    query: unknown,
    req: Request,
  ): Promise<GameSession> {
    const { gameSession, currentParticipant, player } = await this.setupInventoryOperation(
      params.gameSessionId,
      params.participantId,
      req
    );

    const { inventory } = this.findInventory(player, params.inventoryId);
    inventory.current.push(item);

    return this.finalizeOperation(gameSession, currentParticipant, {
      type: 'item-added-to-inventory',
      title: 'Item Added',
      description: `${currentParticipant.name} added item ${item.name} to ${player.name}'s inventory`,
      metadata: { itemId: item.id, itemName: item.name, inventoryId: params.inventoryId }
    });
  }

  @Put('/game-sessions/:gameSessionId/participants/:participantId/inventories/:inventoryId/items/:itemId')
  public async editItemInInventory(
    item: Item,
    params: {gameSessionId: string, participantId: string, inventoryId: string, itemId: string},
    query: unknown,
    req: Request,
  ): Promise<GameSession> {
    const { gameSession, currentParticipant, player } = await this.setupInventoryOperation(
      params.gameSessionId,
      params.participantId,
      req
    );

    const { inventory, inventoryIndex } = this.findInventory(player, params.inventoryId);
    const { itemIndex } = this.findItem(inventory, params.itemId);

    player.attributes.inventory[inventoryIndex].current[itemIndex] = item;

    return this.finalizeOperation(gameSession, currentParticipant, {
      type: 'item-edited-in-inventory',
      title: 'Item Edited',
      description: `${currentParticipant.name} edited item ${item.name} in ${player.name}'s inventory`,
      metadata: { itemId: item.id, itemName: item.name, inventoryId: params.inventoryId }
    });
  }

  @Delete('/game-sessions/:gameSessionId/participants/:participantId/inventories/:inventoryId/items/:itemId')
  public async deleteItemFromInventory(
    body: unknown,
    params: {gameSessionId: string, participantId: string, inventoryId: string, itemId: string},
    query: unknown,
    req: Request,
  ): Promise<GameSession> {
    const { gameSession, currentParticipant, player } = await this.setupInventoryOperation(
      params.gameSessionId,
      params.participantId,
      req
    );

    const { inventory, inventoryIndex } = this.findInventory(player, params.inventoryId);
    const { itemIndex, item: deletedItem } = this.findItem(inventory, params.itemId);

    player.attributes.inventory[inventoryIndex].current.splice(itemIndex, 1);

    return this.finalizeOperation(gameSession, currentParticipant, {
      type: 'item-deleted-from-inventory',
      title: 'Item Deleted',
      description: `${currentParticipant.name} deleted item ${deletedItem.name} from ${player.name}'s inventory`,
      metadata: { itemId: params.itemId, itemName: deletedItem.name, inventoryId: params.inventoryId }
    });
  }

  @Post('/game-sessions/:gameSessionId/participants/:participantId/inventories/add')
  public async addInventoryForPlayer(
    body: AttributeInventory,
    params: {gameSessionId: string, participantId: string},
    query: unknown,
    req: Request,
  ): Promise<GameSession> {
    const { gameSession, currentParticipant, player } = await this.setupInventoryOperation(
      params.gameSessionId,
      params.participantId,
      req
    );

    // Generate ID for the new inventory
    body.id = `inventory-${body.name}-${Date.now()}`;
    player.attributes.inventory.push(body);

    return this.finalizeOperation(gameSession, currentParticipant, {
      type: 'inventory-added',
      title: 'Inventory Added',
      description: `${currentParticipant.name} added inventory ${body.name} to ${player.name}`,
      metadata: { inventory: body }
    });
  }

  @Put('/game-sessions/:gameSessionId/participants/:participantId/inventories/:inventoryId/update')
  public async updateInventoryForPlayer(
    body: AttributeInventory,
    params: {gameSessionId: string, participantId: string, inventoryId: string},
    query: unknown,
    req: Request,
  ): Promise<GameSession> {
    const { gameSession, currentParticipant, player } = await this.setupInventoryOperation(
      params.gameSessionId,
      params.participantId,
      req
    );

    const { inventoryIndex } = this.findInventory(player, params.inventoryId);

    // Preserve the current items when updating
    body.id = params.inventoryId;
    const currentItems = player.attributes.inventory[inventoryIndex].current;
    body.current = currentItems;

    player.attributes.inventory[inventoryIndex] = body;

    return this.finalizeOperation(gameSession, currentParticipant, {
      type: 'inventory-updated',
      title: 'Inventory Updated',
      description: `${currentParticipant.name} updated inventory ${body.name} for ${player.name}`,
      metadata: { inventoryId: params.inventoryId, inventoryName: body.name }
    });
  }

  @Delete('/game-sessions/:gameSessionId/participants/:participantId/inventories/:inventoryId/delete')
  public async deleteInventoryForPlayer(
    body: unknown,
    params: {gameSessionId: string, participantId: string, inventoryId: string},
    query: unknown,
    req: Request,
  ): Promise<GameSession> {
    const { gameSession, currentParticipant, player } = await this.setupInventoryOperation(
      params.gameSessionId,
      params.participantId,
      req
    );

    const { inventoryIndex, inventory } = this.findInventory(player, params.inventoryId);

    player.attributes.inventory.splice(inventoryIndex, 1);

    return this.finalizeOperation(gameSession, currentParticipant, {
      type: 'inventory-deleted',
      title: 'Inventory Deleted',
      description: `${currentParticipant.name} deleted inventory ${inventory.name || params.inventoryId} from ${player.name}`,
      metadata: { inventoryId: params.inventoryId, inventoryName: inventory.name }
    });
  }
}
