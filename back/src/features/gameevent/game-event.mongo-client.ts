import { Document, ObjectId, WithId } from 'mongodb';
import { BaseMongoClient, MongoConnection } from '../../core/database/base-mongo-client';
import { LoggerService } from '../../core/logger.service';
import { EventBase } from '../../pagemaster-schemas/src/events.types';

// MongoDB document type that extends the domain type
export type EventDocument = EventBase & Document;

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

            console.log('GameEvent collection indexes initialized');
        } catch (error) {
            console.error('Failed to initialize GameEvent collection indexes', error);
            throw error;
        }
    }

    public async createEvent(event: EventBase): Promise<WithId<EventDocument>> {
        const result = await this.insertOne<EventDocument>(
            GameEventMongoClient.COLLECTION_NAME,
            event as EventDocument
        );

        const inserted = await this.findEventByMongoId(result.insertedId.toString());
        if (!inserted) {
            throw new Error('Failed to retrieve inserted Event');
        }
        return inserted;
    }

    public async findEventById(id: string): Promise<WithId<EventDocument> | null> {
        return this.findOne<EventDocument>(
            GameEventMongoClient.COLLECTION_NAME,
            { id }
        );
    }

    public async findEventByMongoId(id: string): Promise<WithId<EventDocument> | null> {
        return this.findOne<EventDocument>(
            GameEventMongoClient.COLLECTION_NAME,
            { _id: new ObjectId(id) }
        );
    }

    public async getAllEvents(): Promise<WithId<EventDocument>[]> {
        return this.find<EventDocument>(
            GameEventMongoClient.COLLECTION_NAME
        );
    }

    public async updateEvent(id: string, update: Partial<EventBase>): Promise<EventBase> {
        await this.updateOne<EventDocument>(
            GameEventMongoClient.COLLECTION_NAME,
            { id },
            { $set: update }
        );
        const updated = await this.findEventById(id);
        if (!updated) {
            throw new Error('Failed to retrieve updated Event');
        }
        return updated;
    }

    public async deleteEvent(id: string): Promise<boolean> {
        const result = await this.deleteOne<EventDocument>(
            GameEventMongoClient.COLLECTION_NAME,
            { _id: new ObjectId(id) }
        );
        return result.deletedCount > 0;
    }

    public async countEvents(): Promise<number> {
        return this.countDocuments<EventDocument>(GameEventMongoClient.COLLECTION_NAME);
    }
}