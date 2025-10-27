import { Document, WithId } from 'mongodb';
import { BaseMongoClient, MongoConnection } from '../../core/base-mongo-client';
import { LoggerService } from '../../core/logger.service';
import { GameSession } from '../../pagemaster-schemas/src/pagemaster.types';

// MongoDB document type that extends the domain type
export type GameSessionDocument = GameSession & Document;

export class GameSessionMongoClient extends BaseMongoClient {
    private static readonly COLLECTION_NAME = 'gamesessions';

    constructor(
        logger: LoggerService,
        mongoConnection: MongoConnection,
        secureMode = true
    ) {
        super(logger, mongoConnection, secureMode);
    }

    /**
     * Initialize the collection with indexes
     */
    public async initializeIndexes(): Promise<void> {
        try {
            await this.createIndex(
                GameSessionMongoClient.COLLECTION_NAME,
                { id: 1 },
                { unique: true }
            );
            await this.createIndex(
                GameSessionMongoClient.COLLECTION_NAME,
                { 'gameInstance.gameDefId': 1 }
            );

            console.log('GameSession collection indexes initialized');
        } catch (error) {
            console.error('Failed to initialize GameSession collection indexes', error);
            throw error;
        }
    }

    public async createGameSession(gameSession: GameSession): Promise<WithId<GameSessionDocument>> {
        await this.insertOne<GameSessionDocument>(
            GameSessionMongoClient.COLLECTION_NAME,
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
            GameSessionMongoClient.COLLECTION_NAME,
            { id }
        );
    }

    public async getAllActiveSessions(): Promise<WithId<GameSessionDocument>[]> {
        return this.find<GameSessionDocument>(
            GameSessionMongoClient.COLLECTION_NAME,
            { 'onlinePlayers.0': { $exists: true } } // Sessions with at least one online player
        );
    }

    public async updateGameSession(id: string, update: Partial<GameSession>): Promise<boolean> {
        const result = await this.updateOne<GameSessionDocument>(
            GameSessionMongoClient.COLLECTION_NAME,
            { id },
            { $set: update }
        );
        return result.modifiedCount > 0;
    }

    public async deleteGameSession(id: string): Promise<boolean> {
        const result = await this.deleteOne<GameSessionDocument>(
            GameSessionMongoClient.COLLECTION_NAME,
            { id }
        );
        return result.deletedCount > 0;
    }

    public async countGameSessions(): Promise<number> {
        return this.countDocuments<GameSessionDocument>(GameSessionMongoClient.COLLECTION_NAME);
    }
}

