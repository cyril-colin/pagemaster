import { LoggerService } from '../../core/logger.service';
import { GameDef } from '../../pagemaster-schemas/src/pagemaster.types';
import { GameDefMongoClient } from './gamedef.mongo-client';

const defaultGameDef: GameDef = {
  id: "medieval-fantasy-v1",
  name: "Medieval Fantasy Adventure",
  version: "1.0.0",
  description: "A classic medieval fantasy RPG with wizards, warriors, and mythical creatures.",
  minPlayers: 2,
  maxPlayers: 6,
  possibleItems: []
}

export class GameDefFixture {
  constructor(
    private logger: LoggerService,
    private mongoClient: GameDefMongoClient,
  ) {}

  public async initFirstGameDef(): Promise<void> {
    const existing = await this.mongoClient.findGameDefById(defaultGameDef.id);
    if (existing) {
      this.logger.info(`Default GameDef with id '${defaultGameDef.id}' already exists. Skipping creation.`);
      return;
    }
    this.logger.info(`Default GameDef with id '${defaultGameDef.id}' does not exist. Creating new GameDef.`);
    await this.mongoClient.createGameDef(defaultGameDef);
  }
}