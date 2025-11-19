
import Ajv from "ajv";
import { ConfigurationService } from './config/configuration.service';
import { MongoConnection } from './core/database/base-mongo-client';
import { LoggerService } from './core/logger.service';
import { Router } from './core/router/route-registry';
import { SocketServerService } from './core/socket.service';
import { GameEventMongoClient } from "./features/gameevent/game-event.mongo-client";
import { GameSessionFixture } from './features/gamesession/game-session.fixture';
import { GameSessionMongoClient } from './features/gamesession/game-session.mongo-client';
import { GameSessionService } from './features/gamesession/game-session.service';
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
const gameInstanceMongoClient = new GameSessionMongoClient(logger, mongoConnection, true);
const gameEventMongoClient = new GameEventMongoClient(logger, mongoConnection, true);

export const router = new Router(logger, ajv);

const socketServerService = new SocketServerService(logger);

// Create the game instance service (composition over inheritance)
const gameInstanceService = new GameSessionService(gameInstanceMongoClient, socketServerService);
const gameInstanceFixture = new GameSessionFixture(logger, gameInstanceMongoClient);

export const serviceContainer = {
  logger,
  configuration,
  router,
  socketServerService,
  mongoConnection,
  gameInstanceFixture,
  gameInstanceMongoClient,
  gameEventMongoClient,
  gameInstanceService,
  jsonSchemaValidator: ajv,
};
