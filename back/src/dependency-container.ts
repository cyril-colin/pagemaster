
import Ajv from "ajv";
import { ConfigurationService } from './config/configuration.service';
import { LoggerService } from './core/logger.service';
import { PageMasterMongoClient } from './core/pagemaster-mongo-client';
import { Router } from './core/router/route-registry';
import { SocketServerService } from './core/socket.service';
import { GameDefFixture } from './features/gamedef/gamedef.fixture';
import { GameInstanceFixture } from './features/gameinstance/game-instance.fixture';

const ajv = new Ajv({ allErrors: true });
const configuration = new ConfigurationService(ajv);
configuration.init();
const logger = new LoggerService(configuration);
const mongoClient = new PageMasterMongoClient(logger, configuration, true);

export const router = new Router(logger, ajv);

const socketServerService = new SocketServerService(logger);

const gameDefFixture = new GameDefFixture(logger, mongoClient);
const gameInstanceFixture = new GameInstanceFixture(logger, mongoClient);
export const serviceContainer = {
  logger,
  configuration,
  router,
  socketServerService,
  gameDefFixture,
  gameInstanceFixture,
  mongoClient,
  jsonSchemaValidator: ajv,
};
