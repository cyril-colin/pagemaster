import { Document, ObjectId, WithId } from 'mongodb';
import { ConfigurationService } from '../config/configuration.service';
import { LoggerService } from '../core/logger.service';
import { AbstractMongoClient, MongoConnectionConfig } from '../core/mongo-client';
import { GameDef, GameInstance, GameSession } from '../pagemaster-schemas/src/pagemaster.types';

// MongoDB document types that extend our domain types
export type GameDefDocument = GameDef & Document;
export type GameInstanceDocument = GameInstance & Document;
export type GameSessionDocument = GameSession & Document;

export class PageMasterMongoClient extends AbstractMongoClient {
    private static readonly COLLECTION_GAMEDEFS = 'gamedefs';
    private static readonly COLLECTION_GAMEINSTANCES = 'gameinstances';
    private static readonly COLLECTION_GAMESESSIONS = 'gamesessions';

    protected get connectionConfig(): MongoConnectionConfig {
        const config = this.configurationService.getConfig();
        return {
            url: config.database.mongodb.url,
            dbName: config.database.mongodb.dbName
        };
    }

    constructor(
        logger: LoggerService,
        private configurationService: ConfigurationService,
        secureMode = true
    ) {
        super(logger, secureMode);
    }

    /**
     * Initialize the database with indexes
     */
    public async initializeDatabase(): Promise<void> {
        try {
            // Create indexes for GameDefs
            await this.createIndex<GameDefDocument>(
                PageMasterMongoClient.COLLECTION_GAMEDEFS,
                { id: 1 },
                { unique: true }
            );
            await this.createIndex<GameDefDocument>(
                PageMasterMongoClient.COLLECTION_GAMEDEFS,
                { name: 1 }
            );
            await this.createIndex<GameDefDocument>(
                PageMasterMongoClient.COLLECTION_GAMEDEFS,
                { version: 1 }
            );

            // Create indexes for GameInstances
            await this.createIndex<GameInstanceDocument>(
                PageMasterMongoClient.COLLECTION_GAMEINSTANCES,
                { gameDefId: 1 }
            );
            await this.createIndex<GameInstanceDocument>(
                PageMasterMongoClient.COLLECTION_GAMEINSTANCES,
                { 'gameDef.id': 1 }
            );

            // Create indexes for GameSessions
            await this.createIndex<GameSessionDocument>(
                PageMasterMongoClient.COLLECTION_GAMESESSIONS,
                { id: 1 },
                { unique: true }
            );
            await this.createIndex<GameSessionDocument>(
                PageMasterMongoClient.COLLECTION_GAMESESSIONS,
                { 'gameInstance.gameDefId': 1 }
            );

            this.logger.info('PageMaster MongoDB database initialized with indexes');
        } catch (error) {
            this.logger.error('Failed to initialize PageMaster MongoDB database', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    // GameDef operations
    public async createGameDef(gameDef: GameDef): Promise<WithId<GameDefDocument>> {
        await this.insertOne<GameDefDocument>(
            PageMasterMongoClient.COLLECTION_GAMEDEFS,
            gameDef as GameDefDocument
        );
        
        const inserted = await this.findGameDefById(gameDef.id);
        if (!inserted) {
            throw new Error('Failed to retrieve inserted GameDef');
        }
        return inserted;
    }

    public async findGameDefById(id: string): Promise<WithId<GameDefDocument> | null> {
        return this.findOne<GameDefDocument>(
            PageMasterMongoClient.COLLECTION_GAMEDEFS,
            { id }
        );
    }

    public async findGameDefsByName(name: string): Promise<WithId<GameDefDocument>[]> {
        return this.find<GameDefDocument>(
            PageMasterMongoClient.COLLECTION_GAMEDEFS,
            { name: { $regex: name, $options: 'i' } }
        );
    }

    public async getAllGameDefs(): Promise<WithId<GameDefDocument>[]> {
        return this.find<GameDefDocument>(
            PageMasterMongoClient.COLLECTION_GAMEDEFS
        );
    }

    public async updateGameDef(id: string, update: Partial<GameDef>): Promise<boolean> {
        const result = await this.updateOne<GameDefDocument>(
            PageMasterMongoClient.COLLECTION_GAMEDEFS,
            { id },
            { $set: update }
        );
        return result.modifiedCount > 0;
    }

    public async deleteGameDef(id: string): Promise<boolean> {
        const result = await this.deleteOne<GameDefDocument>(
            PageMasterMongoClient.COLLECTION_GAMEDEFS,
            { id }
        );
        return result.deletedCount > 0;
    }

    // GameInstance operations
    public async createGameInstance(gameInstance: GameInstance): Promise<WithId<GameInstanceDocument>> {
        const result = await this.insertOne<GameInstanceDocument>(
            PageMasterMongoClient.COLLECTION_GAMEINSTANCES,
            gameInstance as GameInstanceDocument
        );
        
        const inserted = await this.findGameInstanceByMongoId(result.insertedId.toString());
        if (!inserted) {
            throw new Error('Failed to retrieve inserted GameInstance');
        }
        return inserted;
    }

    public async findGameInstanceById(id: string): Promise<WithId<GameInstanceDocument> | null> {
      return this.findOne<GameInstanceDocument>(PageMasterMongoClient.COLLECTION_GAMEINSTANCES, { id });
    }

    
    public async findGameInstanceByMongoId(id: string): Promise<WithId<GameInstanceDocument> | null> {
      return this.findOne<GameInstanceDocument>(
        PageMasterMongoClient.COLLECTION_GAMEINSTANCES,
        { _id: new ObjectId(id) }
      );

    }

    public async findGameInstancesByGameDefId(gameDefId: string): Promise<WithId<GameInstanceDocument>[]> {
        return this.find<GameInstanceDocument>(
            PageMasterMongoClient.COLLECTION_GAMEINSTANCES,
            { gameDefId }
        );
    }

    public async getAllGameInstances(): Promise<WithId<GameInstanceDocument>[]> {
        return this.find<GameInstanceDocument>(
            PageMasterMongoClient.COLLECTION_GAMEINSTANCES
        );
    }

    public async updateGameInstance(id: string, version:number, update: GameInstance): Promise<GameInstance> {
        await this.updateOne<GameInstanceDocument>(
            PageMasterMongoClient.COLLECTION_GAMEINSTANCES,
            { id, version },
            { $set: update }
        );
        const updated = await this.findGameInstanceById(id);
        if (!updated) {
            throw new Error('Failed to retrieve updated GameInstance');
        }
        return updated;
    }

    public async deleteGameInstance(id: string): Promise<boolean> {
        const result = await this.deleteOne<GameInstanceDocument>(
            PageMasterMongoClient.COLLECTION_GAMEINSTANCES,
            { _id: new ObjectId(id) }
        );
        return result.deletedCount > 0;
    }

    // GameSession operations
    public async createGameSession(gameSession: GameSession): Promise<WithId<GameSessionDocument>> {
        await this.insertOne<GameSessionDocument>(
            PageMasterMongoClient.COLLECTION_GAMESESSIONS,
            gameSession as GameSessionDocument
        );
        
        const inserted = await this.findGameSessionById(gameSession.id);
        if (!inserted) {
            throw new Error('Failed to retrieve inserted GameSession');
        }
        return inserted;
    }

    public async findGameSessionById(id: string): Promise<WithId<GameSessionDocument> | null> {
        return this.findOne<GameSessionDocument>(
            PageMasterMongoClient.COLLECTION_GAMESESSIONS,
            { id }
        );
    }

    public async getAllActiveSessions(): Promise<WithId<GameSessionDocument>[]> {
        return this.find<GameSessionDocument>(
            PageMasterMongoClient.COLLECTION_GAMESESSIONS,
            { 'onlinePlayers.0': { $exists: true } } // Sessions with at least one online player
        );
    }

    public async updateGameSession(id: string, update: Partial<GameSession>): Promise<boolean> {
        const result = await this.updateOne<GameSessionDocument>(
            PageMasterMongoClient.COLLECTION_GAMESESSIONS,
            { id },
            { $set: update }
        );
        return result.modifiedCount > 0;
    }

    public async deleteGameSession(id: string): Promise<boolean> {
        const result = await this.deleteOne<GameSessionDocument>(
            PageMasterMongoClient.COLLECTION_GAMESESSIONS,
            { id }
        );
        return result.deletedCount > 0;
    }

    // Utility methods
    public async getCollectionCounts(): Promise<{gamedefs: number, gameinstances: number, gamesessions: number}> {
        const [gamedefsCount, gameinstancesCount, gamesessionsCount] = await Promise.all([
            this.countDocuments(PageMasterMongoClient.COLLECTION_GAMEDEFS),
            this.countDocuments(PageMasterMongoClient.COLLECTION_GAMEINSTANCES),
            this.countDocuments(PageMasterMongoClient.COLLECTION_GAMESESSIONS)
        ]);

        return {
            gamedefs: gamedefsCount,
            gameinstances: gameinstancesCount,
            gamesessions: gamesessionsCount
        };
    }
}
