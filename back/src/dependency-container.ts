
import Ajv from "ajv";
import { ConfigurationService } from './config/configuration.service';
import { MongoConnection } from './core/base-mongo-client';
import { LoggerService } from './core/logger.service';
import { Router } from './core/router/route-registry';
import { SocketServerService } from './core/socket.service';
import { GameDefFixture } from './features/gamedef/gamedef.fixture';
import { GameDefMongoClient } from './features/gamedef/gamedef.mongo-client';
import { GameEventFixture } from './features/gameevent/game-event.fixture';
import { GameEventMongoClient } from './features/gameevent/game-event.mongo-client';
import { GameInstanceFixture } from './features/gameinstance/game-instance.fixture';
import { GameInstanceMongoClient } from './features/gameinstance/game-instance.mongo-client';
import { GameInstanceService } from './features/gameinstance/game-instance.service';
import { GameSessionMongoClient } from './features/gamesession/game-session.mongo-client';

const ajv = new Ajv({ allErrors: true });
const configuration = new ConfigurationService(ajv);
configuration.init();
const logger = new LoggerService(configuration);

// Create a single shared MongoDB connection
const mongoConfig = {
  url: configuration.getConfig().database.mongodb.url,
  dbName: configuration.getConfig().database.mongodb.dbName
};
const mongoConnection = new MongoConnection(logger, mongoConfig, true);

// Create all mongo clients - they share the same connection via mongoConnection
const gameDefMongoClient = new GameDefMongoClient(logger, mongoConnection, true);
const gameInstanceMongoClient = new GameInstanceMongoClient(logger, mongoConnection, true);
const gameEventMongoClient = new GameEventMongoClient(logger, mongoConnection, true);
const gameSessionMongoClient = new GameSessionMongoClient(logger, mongoConnection, true);

export const router = new Router(logger, ajv);

const socketServerService = new SocketServerService(logger, gameEventMongoClient);

// Create the game instance service (composition over inheritance)
const gameInstanceService = new GameInstanceService(gameInstanceMongoClient, socketServerService);

const gameDefFixture = new GameDefFixture(logger, gameDefMongoClient);
const gameInstanceFixture = new GameInstanceFixture(logger, gameInstanceMongoClient);
const gameEventFixture = new GameEventFixture(logger, gameEventMongoClient);

export const serviceContainer = {
  logger,
  configuration,
  router,
  socketServerService,
  mongoConnection,
  gameDefFixture,
  gameInstanceFixture,
  gameEventFixture,
  gameDefMongoClient,
  gameInstanceMongoClient,
  gameInstanceService,
  gameEventMongoClient,
  gameSessionMongoClient,
  jsonSchemaValidator: ajv,
};
