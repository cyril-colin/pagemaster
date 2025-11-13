import { Request } from 'express';
import { AttributeInventory } from 'src/pagemaster-schemas/src/attributes.types';
import { Delete, Patch, Post, Put } from '../../core/router/controller.decorators';
import { HttpBadRequestError, HttpForbiddenError } from '../../core/router/http-errors';
import { Item } from '../../pagemaster-schemas/src/items.types';
import { Character, GameInstance, Participant } from '../../pagemaster-schemas/src/pagemaster.types';
import { GameInstanceService } from './game-instance.service';

type Player = Participant & { type: 'player' };

export class ParticipantInventoryController {
  constructor(private gameInstanceService: GameInstanceService) {}

  private async setupInventoryOperation(
    gameInstanceId: string,
    participantId: string,
    req: Request
  ) {
    const { gameInstance, currentParticipant } = await this.gameInstanceService.validateContext(
      gameInstanceId,
      req,
      'player'
    );
    this.gameInstanceService.validateParticipantPermission(currentParticipant, participantId);

    const participantIndex = this.gameInstanceService.findParticipantIndex(gameInstance, participantId);
    const player = gameInstance.participants[participantIndex];
    this.gameInstanceService.validatePlayerType(player);

    return { gameInstance, currentParticipant, player: player as Player, participantIndex };
  }

  private findInventory(player: Player, inventoryId: string) {
    const inventoryIndex = player.character.attributes.inventory.findIndex(
      inv => inv.id === inventoryId
    );
    if (inventoryIndex === -1) {
      throw new HttpBadRequestError('Inventory not found for the specified participant');
    }
    return { inventoryIndex, inventory: player.character.attributes.inventory[inventoryIndex] };
  }

  private findItem(inventory: Character['attributes']['inventory'][0], itemId: string) {
    const itemIndex = inventory.current.findIndex(i => i.id === itemId);
    if (itemIndex === -1) {
      throw new HttpBadRequestError('Item not found in the specified inventory');
    }
    return { itemIndex, item: inventory.current[itemIndex] };
  }

  private async finalizeOperation(
    gameInstance: GameInstance,
    currentParticipant: Participant,
    event: { type: string; title: string; description: string; metadata?: Record<string, unknown> }
  ) {
    const gameInstanceCleaned = await this.gameInstanceService.commitGameInstance(gameInstance);

    const updatedParticipant = this.gameInstanceService.getParticipant(
      currentParticipant.id,
      gameInstanceCleaned
    );
    if (!updatedParticipant) {
      throw new HttpForbiddenError('Forbidden: You are no longer a participant of this game instance');
    }

    this.gameInstanceService.notifyGameInstanceUpdate({
      gameInstance: gameInstanceCleaned,
      by: updatedParticipant,
      event
    });

    return gameInstanceCleaned;
  }

  @Patch('/game-instances/:gameInstanceId/participants/:participantId/inventories')
  public async updateParticipantInventories(
    attributes: Pick<Character['attributes'], 'inventory'>,
    params: {gameInstanceId: string, participantId: string},
    query: unknown,
    req: Request,
  ): Promise<GameInstance> {
    const { gameInstance, currentParticipant, player } = await this.setupInventoryOperation(
      params.gameInstanceId,
      params.participantId,
      req
    );

    player.character.attributes.inventory = attributes.inventory;

    return this.finalizeOperation(gameInstance, currentParticipant, {
      type: 'participant-inventories-update',
      title: 'Inventories Updated',
      description: `${currentParticipant.name} updated inventories of ${player.character.name}`,
    });
  }

  @Post('/game-instances/:gameInstanceId/participants/:participantId/inventories/:inventoryId/items')
  public async addItemToInventory(
    item: Item,
    params: {gameInstanceId: string, participantId: string, inventoryId: string},
    query: unknown,
    req: Request,
  ): Promise<GameInstance> {
    const { gameInstance, currentParticipant, player } = await this.setupInventoryOperation(
      params.gameInstanceId,
      params.participantId,
      req
    );

    const { inventory } = this.findInventory(player, params.inventoryId);
    inventory.current.push(item);

    return this.finalizeOperation(gameInstance, currentParticipant, {
      type: 'item-added-to-inventory',
      title: 'Item Added',
      description: `${currentParticipant.name} added item ${item.name} to ${player.character.name}'s inventory`,
      metadata: { itemId: item.id, itemName: item.name, inventoryId: params.inventoryId }
    });
  }

  @Put('/game-instances/:gameInstanceId/participants/:participantId/inventories/:inventoryId/items/:itemId')
  public async editItemInInventory(
    item: Item,
    params: {gameInstanceId: string, participantId: string, inventoryId: string, itemId: string},
    query: unknown,
    req: Request,
  ): Promise<GameInstance> {
    const { gameInstance, currentParticipant, player } = await this.setupInventoryOperation(
      params.gameInstanceId,
      params.participantId,
      req
    );

    const { inventory, inventoryIndex } = this.findInventory(player, params.inventoryId);
    const { itemIndex } = this.findItem(inventory, params.itemId);

    player.character.attributes.inventory[inventoryIndex].current[itemIndex] = item;

    return this.finalizeOperation(gameInstance, currentParticipant, {
      type: 'item-edited-in-inventory',
      title: 'Item Edited',
      description: `${currentParticipant.name} edited item ${item.name} in ${player.character.name}'s inventory`,
      metadata: { itemId: item.id, itemName: item.name, inventoryId: params.inventoryId }
    });
  }

  @Delete('/game-instances/:gameInstanceId/participants/:participantId/inventories/:inventoryId/items/:itemId')
  public async deleteItemFromInventory(
    body: unknown,
    params: {gameInstanceId: string, participantId: string, inventoryId: string, itemId: string},
    query: unknown,
    req: Request,
  ): Promise<GameInstance> {
    const { gameInstance, currentParticipant, player } = await this.setupInventoryOperation(
      params.gameInstanceId,
      params.participantId,
      req
    );

    const { inventory, inventoryIndex } = this.findInventory(player, params.inventoryId);
    const { itemIndex, item: deletedItem } = this.findItem(inventory, params.itemId);

    player.character.attributes.inventory[inventoryIndex].current.splice(itemIndex, 1);

    return this.finalizeOperation(gameInstance, currentParticipant, {
      type: 'item-deleted-from-inventory',
      title: 'Item Deleted',
      description: `${currentParticipant.name} deleted item ${deletedItem.name} from ${player.character.name}'s inventory`,
      metadata: { itemId: params.itemId, itemName: deletedItem.name, inventoryId: params.inventoryId }
    });
  }

  @Post('/game-instances/:gameInstanceId/participants/:participantId/inventories/add')
  public async addInventoryForCharacter(
    body: AttributeInventory,
    params: {gameInstanceId: string, participantId: string},
    query: unknown,
    req: Request,
  ): Promise<GameInstance> {
    const { gameInstance, currentParticipant, player } = await this.setupInventoryOperation(
      params.gameInstanceId,
      params.participantId,
      req
    );

    // Generate ID for the new inventory
    body.id = `inventory-${body.name}-${Date.now()}`;
    player.character.attributes.inventory.push(body);

    return this.finalizeOperation(gameInstance, currentParticipant, {
      type: 'inventory-added',
      title: 'Inventory Added',
      description: `${currentParticipant.name} added inventory ${body.name} to ${player.character.name}`,
      metadata: { inventory: body }
    });
  }

  @Put('/game-instances/:gameInstanceId/participants/:participantId/inventories/:inventoryId/update')
  public async updateInventoryForCharacter(
    body: AttributeInventory,
    params: {gameInstanceId: string, participantId: string, inventoryId: string},
    query: unknown,
    req: Request,
  ): Promise<GameInstance> {
    const { gameInstance, currentParticipant, player } = await this.setupInventoryOperation(
      params.gameInstanceId,
      params.participantId,
      req
    );

    const { inventoryIndex } = this.findInventory(player, params.inventoryId);

    // Preserve the current items when updating
    body.id = params.inventoryId;
    const currentItems = player.character.attributes.inventory[inventoryIndex].current;
    body.current = currentItems;

    player.character.attributes.inventory[inventoryIndex] = body;

    return this.finalizeOperation(gameInstance, currentParticipant, {
      type: 'inventory-updated',
      title: 'Inventory Updated',
      description: `${currentParticipant.name} updated inventory ${body.name} for ${player.character.name}`,
      metadata: { inventoryId: params.inventoryId, inventoryName: body.name }
    });
  }

  @Delete('/game-instances/:gameInstanceId/participants/:participantId/inventories/:inventoryId/delete')
  public async deleteInventoryForCharacter(
    body: unknown,
    params: {gameInstanceId: string, participantId: string, inventoryId: string},
    query: unknown,
    req: Request,
  ): Promise<GameInstance> {
    const { gameInstance, currentParticipant, player } = await this.setupInventoryOperation(
      params.gameInstanceId,
      params.participantId,
      req
    );

    const { inventoryIndex, inventory } = this.findInventory(player, params.inventoryId);

    player.character.attributes.inventory.splice(inventoryIndex, 1);

    return this.finalizeOperation(gameInstance, currentParticipant, {
      type: 'inventory-deleted',
      title: 'Inventory Deleted',
      description: `${currentParticipant.name} deleted inventory ${inventory.name || params.inventoryId} from ${player.character.name}`,
      metadata: { inventoryId: params.inventoryId, inventoryName: inventory.name }
    });
  }
}
