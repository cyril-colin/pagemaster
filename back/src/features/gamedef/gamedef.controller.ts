import { Delete, Get, Post, Put } from '../../core/router/controller.decorators';
import { GameDef } from '../../pagemaster-schemas/src/pagemaster.types';
import { GameDefMongoClient } from './gamedef.mongo-client';

export class GameDefController {
  constructor(
    private mongoClient: GameDefMongoClient,
  ) {}

  @Get('/gamedefs')
  public async getAllGameDefs(): Promise<GameDef[]> {
    const gameDefDocuments = await this.mongoClient.getAllGameDefs();
    
    // Convert MongoDB documents to plain GameDef objects (remove MongoDB _id field)
    return gameDefDocuments.map(doc => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _id, ...gameDef } = doc;
      return gameDef as GameDef;
    });
  }

  @Get('/gamedefs/:id')
  public async getGameDefById(body: unknown, params: {id: string}): Promise<GameDef | null> {
    const doc = await this.mongoClient.findGameDefById(params.id);
    if (!doc) return null;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...gameDef } = doc;
    return gameDef as GameDef;
  }

  @Post('/gamedefs')
  public async createGameDef(gameDef: GameDef): Promise<GameDef> {
    const doc = await this.mongoClient.createGameDef(gameDef);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...createdGameDef } = doc;
    return createdGameDef as GameDef;
  }

  @Put('/gamedefs/:id')
  public async updateGameDef(id: string, gameDef: Partial<GameDef>): Promise<boolean> {
    const doc = await this.mongoClient.updateGameDef(id, gameDef);
    return doc;
  }

  @Delete('/gamedefs/:id')
  public async deleteGameDef(id: string): Promise<boolean> {
    return await this.mongoClient.deleteGameDef(id);
  }
}