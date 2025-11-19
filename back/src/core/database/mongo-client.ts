import { Collection, CreateIndexesOptions, Db, DeleteOptions, DeleteResult, Document, Filter, FindOptions, IndexSpecification, InsertOneResult, MongoClient, OptionalUnlessRequiredId, UpdateFilter, UpdateOptions, UpdateResult, WithId } from 'mongodb';
import { LoggerService } from '../logger.service';

export class MongoClientError extends Error {
    constructor(
        public override message: string,
        public operation: string,
        public collection?: string,
    ) {
        super();
        this.name = 'MongoClientError';
    }
}

export type MongoConnectionConfig = {
    url: string;
    dbName: string;
};

export abstract class AbstractMongoClient {
    private client: MongoClient | null = null;
    private db: Db | null = null;
    protected abstract get connectionConfig(): MongoConnectionConfig;

    constructor(
        protected logger: LoggerService,
        protected secureMode = true,
    ) {}

    /**
     * Connect to MongoDB. Should be called before any database operations.
     */
    public async connect(): Promise<void> {
        try {
            const config = this.connectionConfig;
            const sanitizedUrl = this.secureMode ? config.url.replace(/\/\/.*@/, '//****:****@') : config.url;
            
            this.logger.debug('MongoDB client connecting', { 
                url: sanitizedUrl, 
                dbName: config.dbName 
            });

            this.client = new MongoClient(config.url);
            await this.client.connect();
            this.db = this.client.db(config.dbName);

            this.logger.info('MongoDB client connected successfully', { 
                dbName: config.dbName 
            });
        } catch (error) {
            this.logger.error('Failed to connect to MongoDB', { 
                error: error instanceof Error ? error.message : String(error) 
            });
            throw new MongoClientError(
                `Failed to connect to MongoDB: ${error instanceof Error ? error.message : String(error)}`,
                'connect'
            );
        }
    }

    /**
     * Disconnect from MongoDB. Should be called when shutting down the application.
     */
    public async disconnect(): Promise<void> {
        try {
            if (this.client) {
                await this.client.close();
                this.client = null;
                this.db = null;
                this.logger.info('MongoDB client disconnected');
            }
        } catch (error) {
            this.logger.error('Error disconnecting from MongoDB', { 
                error: error instanceof Error ? error.message : String(error) 
            });
            throw new MongoClientError(
                `Failed to disconnect from MongoDB: ${error instanceof Error ? error.message : String(error)}`,
                'disconnect'
            );
        }
    }

    /**
     * Get a collection from the database
     */
    protected getCollection<T extends Document = Document>(collectionName: string): Collection<T> {
        if (!this.db) {
            throw new MongoClientError('Database not connected. Call connect() first.', 'getCollection', collectionName);
        }
        return this.db.collection<T>(collectionName);
    }

    /**
     * Check if the client is connected
     */
    public isConnected(): boolean {
        return this.client !== null && this.db !== null;
    }

    /**
     * Insert a single document
     */
    protected async insertOne<T extends Document>(
        collectionName: string, 
        document: OptionalUnlessRequiredId<T>
    ): Promise<InsertOneResult<T>> {
        try {
            const collection = this.getCollection<T>(collectionName);
            const result = await collection.insertOne(document);
            
            this.logger.debug('MongoDB insertOne completed', { 
                collection: collectionName, 
                insertedId: result.insertedId 
            });
            
            return result;
        } catch (error) {
            this.logger.error('MongoDB insertOne failed', { 
                collection: collectionName, 
                error: error instanceof Error ? error.message : String(error) 
            });
            throw new MongoClientError(
                `Failed to insert document: ${error instanceof Error ? error.message : String(error)}`,
                'insertOne',
                collectionName
            );
        }
    }

    /**
     * Find documents
     */
    protected async find<T extends Document>(
        collectionName: string, 
        filter: Filter<T> = {}, 
        options?: FindOptions<T>
    ): Promise<WithId<T>[]> {
        try {
            const collection = this.getCollection<T>(collectionName);
            const cursor = collection.find(filter, options);
            const result = await cursor.toArray();
            
            this.logger.debug('MongoDB find completed', { 
                collection: collectionName, 
                count: result.length,
                filter: this.secureMode ? '[HIDDEN]' : filter 
            });
            
            return result;
        } catch (error) {
            this.logger.error('MongoDB find failed', { 
                collection: collectionName, 
                error: error instanceof Error ? error.message : String(error) 
            });
            throw new MongoClientError(
                `Failed to find documents: ${error instanceof Error ? error.message : String(error)}`,
                'find',
                collectionName
            );
        }
    }

    /**
     * Find a single document
     */
    protected async findOne<T extends Document>(
        collectionName: string, 
        filter: Filter<T>, 
        options?: FindOptions<T>
    ): Promise<WithId<T> | null> {
        try {
            const collection = this.getCollection<T>(collectionName);
            const result = await collection.findOne(filter, options);
            
            this.logger.debug('MongoDB findOne completed', { 
                collection: collectionName, 
                found: result !== null,
                filter: this.secureMode ? '[HIDDEN]' : filter 
            });
            
            return result as WithId<T> | null;
        } catch (error) {
            this.logger.error('MongoDB findOne failed', { 
                collection: collectionName, 
                error: error instanceof Error ? error.message : String(error) 
            });
            throw new MongoClientError(
                `Failed to find document: ${error instanceof Error ? error.message : String(error)}`,
                'findOne',
                collectionName
            );
        }
    }

    /**
     * Update a single document
     */
    protected async updateOne<T extends Document>(
        collectionName: string, 
        filter: Filter<T>, 
        update: UpdateFilter<T>, 
        options?: UpdateOptions
    ): Promise<UpdateResult<T>> {
        try {
            const collection = this.getCollection<T>(collectionName);
            const result = await collection.updateOne(filter, update, options);
            
            this.logger.debug('MongoDB updateOne completed', { 
                collection: collectionName, 
                matchedCount: result.matchedCount,
                modifiedCount: result.modifiedCount,
                filter: this.secureMode ? '[HIDDEN]' : filter 
            });
            
            return result;
        } catch (error) {
            this.logger.error('MongoDB updateOne failed', { 
                collection: collectionName, 
                error: error instanceof Error ? error.message : String(error) 
            });
            throw new MongoClientError(
                `Failed to update document: ${error instanceof Error ? error.message : String(error)}`,
                'updateOne',
                collectionName
            );
        }
    }

    /**
     * Delete a single document
     */
    protected async deleteOne<T extends Document>(
        collectionName: string, 
        filter: Filter<T>, 
        options?: DeleteOptions
    ): Promise<DeleteResult> {
        try {
            const collection = this.getCollection<T>(collectionName);
            const result = await collection.deleteOne(filter, options);
            
            this.logger.debug('MongoDB deleteOne completed', { 
                collection: collectionName, 
                deletedCount: result.deletedCount,
                filter: this.secureMode ? '[HIDDEN]' : filter 
            });
            
            return result;
        } catch (error) {
            this.logger.error('MongoDB deleteOne failed', { 
                collection: collectionName, 
                error: error instanceof Error ? error.message : String(error) 
            });
            throw new MongoClientError(
                `Failed to delete document: ${error instanceof Error ? error.message : String(error)}`,
                'deleteOne',
                collectionName
            );
        }
    }

    /**
     * Count documents in a collection
     */
    protected async countDocuments<T extends Document>(
        collectionName: string, 
        filter: Filter<T> = {}
    ): Promise<number> {
        try {
            const collection = this.getCollection<T>(collectionName);
            const result = await collection.countDocuments(filter);
            
            this.logger.debug('MongoDB countDocuments completed', { 
                collection: collectionName, 
                count: result,
                filter: this.secureMode ? '[HIDDEN]' : filter 
            });
            
            return result;
        } catch (error) {
            this.logger.error('MongoDB countDocuments failed', { 
                collection: collectionName, 
                error: error instanceof Error ? error.message : String(error) 
            });
            throw new MongoClientError(
                `Failed to count documents: ${error instanceof Error ? error.message : String(error)}`,
                'countDocuments',
                collectionName
            );
        }
    }

    /**
     * Create indexes for a collection
     */
    protected async createIndex<T extends Document>(
        collectionName: string, 
        indexSpec: IndexSpecification, 
        options?: CreateIndexesOptions
    ): Promise<string> {
        try {
            const collection = this.getCollection<T>(collectionName);
            const result = await collection.createIndex(indexSpec, options);
            
            this.logger.debug('MongoDB createIndex completed', { 
                collection: collectionName, 
                indexName: result,
                indexSpec: this.secureMode ? '[HIDDEN]' : indexSpec 
            });
            
            return result;
        } catch (error) {
            this.logger.error('MongoDB createIndex failed', { 
                collection: collectionName, 
                error: error instanceof Error ? error.message : String(error) 
            });
            throw new MongoClientError(
                `Failed to create index: ${error instanceof Error ? error.message : String(error)}`,
                'createIndex',
                collectionName
            );
        }
    }
}
