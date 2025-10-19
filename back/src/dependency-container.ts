
import Ajv from "ajv";
import { ConfigurationService } from './config/configuration.service';
import { AuthService } from './core/auth.service';
import { LoggerService } from './core/logger.service';
import { PageMasterMongoClient } from './core/pagemaster-mongo-client';
import { Router } from './core/router/route-registry';
import { SocketServerService } from './core/socket.service';

const ajv = new Ajv({ allErrors: true });
const configuration = new ConfigurationService(ajv);
configuration.init();
const logger = new LoggerService(configuration);
const authService = new AuthService(configuration);
const mongoClient = new PageMasterMongoClient(logger, configuration, true);

export const router = new Router(logger, ajv);

const socketServerService = new SocketServerService(logger);
export const serviceContainer = {
  logger,
  configuration,
  router,
  authService,
  socketServerService,
  mongoClient,
  jsonSchemaValidator: ajv,
};
