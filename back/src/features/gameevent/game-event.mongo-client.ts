import { Document, WithId } from 'mongodb';
import { BaseMongoClient, MongoConnection } from '../../core/base-mongo-client';
import { LoggerService } from '../../core/logger.service';
import { GameEvent } from '../../pagemaster-schemas/src/pagemaster.types';

// MongoDB document type that extends the domain type
export type GameEventDocument = GameEvent & Document;

export class GameEventMongoClient extends BaseMongoClient {
    private static readonly COLLECTION_NAME = 'gameevents';

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
                GameEventMongoClient.COLLECTION_NAME,
                { id: 1 },
                { unique: true }
            );
            await this.createIndex(
                GameEventMongoClient.COLLECTION_NAME,
                { gameInstanceId: 1 }
            );
            await this.createIndex(
                GameEventMongoClient.COLLECTION_NAME,
                { timestamp: -1 }
            );
            await this.createIndex(
                GameEventMongoClient.COLLECTION_NAME,
                { participantId: 1 }
            );

            console.log('GameEvent collection indexes initialized');
        } catch (error) {
            console.error('Failed to initialize GameEvent collection indexes', error);
            throw error;
        }
    }

    public async createGameEvent(gameEvent: GameEvent): Promise<WithId<GameEventDocument>> {
        await this.insertOne<GameEventDocument>(
            GameEventMongoClient.COLLECTION_NAME,
            gameEvent as GameEventDocument
        );
        
        const inserted = await this.findGameEventById(gameEvent.id);
        if (!inserted) {
            throw new Error('Failed to retrieve inserted GameEvent');
        }
        return inserted;
    }

    public async findGameEventById(id: string): Promise<WithId<GameEventDocument> | null> {
        return this.findOne<GameEventDocument>(
            GameEventMongoClient.COLLECTION_NAME,
            { id }
        );
    }

    public async findGameEventsByGameInstanceId(gameInstanceId: string): Promise<WithId<GameEventDocument>[]> {
        return this.find<GameEventDocument>(
            GameEventMongoClient.COLLECTION_NAME,
            { gameInstanceId },
            { sort: { timestamp: -1 } }
        );
    }

    public async findGameEventsByParticipantId(participantId: string): Promise<WithId<GameEventDocument>[]> {
        return this.find<GameEventDocument>(
            GameEventMongoClient.COLLECTION_NAME,
            { participantId },
            { sort: { timestamp: -1 } }
        );
    }

    public async getAllGameEvents(): Promise<WithId<GameEventDocument>[]> {
        return this.find<GameEventDocument>(
            GameEventMongoClient.COLLECTION_NAME,
            {},
            { sort: { timestamp: -1 } }
        );
    }

    public async updateGameEvent(id: string, update: Partial<GameEvent>): Promise<boolean> {
        const result = await this.updateOne<GameEventDocument>(
            GameEventMongoClient.COLLECTION_NAME,
            { id },
            { $set: update }
        );
        return result.modifiedCount > 0;
    }

    public async deleteGameEvent(id: string): Promise<boolean> {
        const result = await this.deleteOne<GameEventDocument>(
            GameEventMongoClient.COLLECTION_NAME,
            { id }
        );
        return result.deletedCount > 0;
    }

    public async countGameEvents(): Promise<number> {
        return this.countDocuments<GameEventDocument>(GameEventMongoClient.COLLECTION_NAME);
    }
}

