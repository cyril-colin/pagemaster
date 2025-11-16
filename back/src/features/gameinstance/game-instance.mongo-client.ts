import { Document, ObjectId, WithId } from 'mongodb';
import { BaseMongoClient, MongoConnection } from '../../core/base-mongo-client';
import { LoggerService } from '../../core/logger.service';
import { GameInstance } from '../../pagemaster-schemas/src/pagemaster.types';

// MongoDB document type that extends the domain type
export type GameInstanceDocument = GameInstance & Document;

export class GameInstanceMongoClient extends BaseMongoClient {
    private static readonly COLLECTION_NAME = 'gameinstances';

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
                GameInstanceMongoClient.COLLECTION_NAME,
                { id: 1 },
                { unique: true }
            );

            console.log('GameInstance collection indexes initialized');
        } catch (error) {
            console.error('Failed to initialize GameInstance collection indexes', error);
            throw error;
        }
    }

    public async createGameInstance(gameInstance: GameInstance): Promise<WithId<GameInstanceDocument>> {
        const result = await this.insertOne<GameInstanceDocument>(
            GameInstanceMongoClient.COLLECTION_NAME,
            gameInstance as GameInstanceDocument
        );
        
        const inserted = await this.findGameInstanceByMongoId(result.insertedId.toString());
        if (!inserted) {
            throw new Error('Failed to retrieve inserted GameInstance');
        }
        return inserted;
    }

    public async findGameInstanceById(id: string): Promise<WithId<GameInstanceDocument> | null> {
        return this.findOne<GameInstanceDocument>(
            GameInstanceMongoClient.COLLECTION_NAME,
            { id }
        );
    }

    public async findGameInstanceByMongoId(id: string): Promise<WithId<GameInstanceDocument> | null> {
        return this.findOne<GameInstanceDocument>(
            GameInstanceMongoClient.COLLECTION_NAME,
            { _id: new ObjectId(id) }
        );
    }

    public async getAllGameInstances(): Promise<WithId<GameInstanceDocument>[]> {
        return this.find<GameInstanceDocument>(
            GameInstanceMongoClient.COLLECTION_NAME
        );
    }

    public async updateGameInstance(id: string, version: number, update: GameInstance): Promise<GameInstance> {
        await this.updateOne<GameInstanceDocument>(
            GameInstanceMongoClient.COLLECTION_NAME,
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
            GameInstanceMongoClient.COLLECTION_NAME,
            { _id: new ObjectId(id) }
        );
        return result.deletedCount > 0;
    }

    public async countGameInstances(): Promise<number> {
        return this.countDocuments<GameInstanceDocument>(GameInstanceMongoClient.COLLECTION_NAME);
    }
}

