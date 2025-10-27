import { Document, WithId } from 'mongodb';
import { BaseMongoClient, MongoConnection } from '../../core/base-mongo-client';
import { LoggerService } from '../../core/logger.service';
import { GameDef } from '../../pagemaster-schemas/src/pagemaster.types';

// MongoDB document type that extends the domain type
export type GameDefDocument = GameDef & Document;

export class GameDefMongoClient extends BaseMongoClient {
    private static readonly COLLECTION_NAME = 'gamedefs';

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
                GameDefMongoClient.COLLECTION_NAME,
                { id: 1 },
                { unique: true }
            );
            await this.createIndex(
                GameDefMongoClient.COLLECTION_NAME,
                { name: 1 }
            );
            await this.createIndex(
                GameDefMongoClient.COLLECTION_NAME,
                { version: 1 }
            );

            console.log('GameDef collection indexes initialized');
        } catch (error) {
            console.error('Failed to initialize GameDef collection indexes', error);
            throw error;
        }
    }

    public async createGameDef(gameDef: GameDef): Promise<WithId<GameDefDocument>> {
        await this.insertOne<GameDefDocument>(
            GameDefMongoClient.COLLECTION_NAME,
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
            GameDefMongoClient.COLLECTION_NAME,
            { id }
        );
    }

    public async findGameDefsByName(name: string): Promise<WithId<GameDefDocument>[]> {
        return this.find<GameDefDocument>(
            GameDefMongoClient.COLLECTION_NAME,
            { name: { $regex: name, $options: 'i' } }
        );
    }

    public async getAllGameDefs(): Promise<WithId<GameDefDocument>[]> {
        return this.find<GameDefDocument>(
            GameDefMongoClient.COLLECTION_NAME
        );
    }

    public async updateGameDef(id: string, update: Partial<GameDef>): Promise<boolean> {
        const result = await this.updateOne<GameDefDocument>(
            GameDefMongoClient.COLLECTION_NAME,
            { id },
            { $set: update }
        );
        return result.modifiedCount > 0;
    }

    public async deleteGameDef(id: string): Promise<boolean> {
        const result = await this.deleteOne<GameDefDocument>(
            GameDefMongoClient.COLLECTION_NAME,
            { id }
        );
        return result.deletedCount > 0;
    }

    public async countGameDefs(): Promise<number> {
        return this.countDocuments<GameDefDocument>(GameDefMongoClient.COLLECTION_NAME);
    }
}

