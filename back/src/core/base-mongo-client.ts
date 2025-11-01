import {
  Collection,
  CreateIndexesOptions,
  Db,
  DeleteOptions,
  DeleteResult,
  Document,
  Filter,
  FindOptions,
  IndexSpecification,
  InsertOneResult,
  MongoClient,
  OptionalUnlessRequiredId,
  UpdateFilter,
  UpdateOptions,
  UpdateResult,
  WithId
} from 'mongodb';
import { LoggerService } from './logger.service';
import { MongoClientError, MongoConnectionConfig } from './mongo-client';

/**
 * MongoDB connection manager.
 * This class manages a single MongoDB connection that is shared across multiple clients.
 * Instance is created and managed by the dependency injection container.
 */
export class MongoConnection {
    private client: MongoClient | null = null;
    private db: Db | null = null;
    private connectionPromise: Promise<void> | null = null;

    constructor(
        private logger: LoggerService,
        private config: MongoConnectionConfig,
        private secureMode: boolean
    ) {}

    public async connect(): Promise<void> {
        // If already connected, return immediately
        if (this.client && this.db) {
            return;
        }

        // If connection is in progress, wait for it
        if (this.connectionPromise) {
            return this.connectionPromise;
        }

        // Start new connection
        this.connectionPromise = this.doConnect();
        try {
            await this.connectionPromise;
        } finally {
            this.connectionPromise = null;
        }
    }

    private async doConnect(): Promise<void> {
        try {
            const sanitizedUrl = this.secureMode 
                ? this.config.url.replace(/\/\/.*@/, '//****:****@') 
                : this.config.url;
            
            this.logger.debug('MongoDB client connecting', { 
                url: sanitizedUrl, 
                dbName: this.config.dbName 
            });

            this.client = new MongoClient(this.config.url);
            await this.client.connect();
            this.db = this.client.db(this.config.dbName);

            this.logger.info('MongoDB client connected successfully', { 
                dbName: this.config.dbName 
            });
        } catch (error) {
            this.logger.error('Failed to connect to MongoDB', { 
                error: error instanceof Error ? error.message : String(error) 
            });
            this.client = null;
            this.db = null;
            throw error;
        }
    }

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
            throw error;
        }
    }

    public isConnected(): boolean {
        return this.client !== null && this.db !== null;
    }

    public getDb(): Db {
        if (!this.db) {
            throw new Error('Database not connected. Call connect() first.');
        }
        return this.db;
    }
}

/**
 * Base MongoDB client that uses composition to manage database operations.
 * Uses a shared MongoConnection instance provided via dependency injection.
 */
export class BaseMongoClient {
    constructor(
        private logger: LoggerService,
        private mongoConnection: MongoConnection,
        private secureMode = true
    ) {}

    public async connect(): Promise<void> {
        return this.mongoConnection.connect();
    }

    public async disconnect(): Promise<void> {
        return this.mongoConnection.disconnect();
    }

    public isConnected(): boolean {
        return this.mongoConnection.isConnected();
    }

    protected getDb(): Db {
        return this.mongoConnection.getDb();
    }

    protected getCollection<T extends Document = Document>(collectionName: string): Collection<T> {
        return this.getDb().collection<T>(collectionName);
    }

    // Public methods that directly use the shared connection
    public async insertOne<T extends Document>(
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

    public async find<T extends Document>(
        collectionName: string,
        filter: Filter<T> = {},
        options?: FindOptions<T>
    ): Promise<WithId<T>[]> {
        try {
            const collection = this.getCollection<T>(collectionName);
            const result = await collection.find(filter, options).toArray();
            
            this.logger.debug('MongoDB find completed', { 
                collection: collectionName, 
                count: result.length,
                filter: this.secureMode ? '[HIDDEN]' : filter 
            });
            
            return result as WithId<T>[];
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

    public async findOne<T extends Document>(
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

    public async updateOne<T extends Document>(
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

    public async deleteOne<T extends Document>(
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

    public async countDocuments<T extends Document>(
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

    public async createIndex(
        collectionName: string,
        indexSpec: IndexSpecification,
        options?: CreateIndexesOptions
    ): Promise<string> {
        try {
            const collection = this.getCollection(collectionName);
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

