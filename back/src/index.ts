import express from 'express';
import { Server } from 'socket.io';
import { spaFallbackMiddleware } from './core/spa-fallback.middleware';
import { serviceContainer } from './dependency-container';
import { GameEventController } from './features/gameevent/game-event.controller';
import { GameSessionController } from './features/gamesession/game-session-crud.controller';
import { ParticipantBarsController } from './features/gamesession/participant-bars.controller';
import { ParticipantInventoryController } from './features/gamesession/participant-inventory.controller';
import { ParticipantProfileController } from './features/gamesession/participant-profile.controller';
import { ParticipantStatusesController } from './features/gamesession/participant-statuses.controller';

const app = express();

app.use(express.json());
const staticPath = serviceContainer.configuration.getConfig().staticFilesPath;
if (staticPath) {
  app.use('/', express.static(staticPath));
  serviceContainer.logger.info('Static files served from', {path: staticPath });
}

const controllers = [
  new GameSessionController(serviceContainer.gameInstanceMongoClient, serviceContainer.socketServerService, serviceContainer.logger),
  new ParticipantBarsController(serviceContainer.gameInstanceService),
  new ParticipantStatusesController(serviceContainer.gameInstanceService),
  new ParticipantProfileController(serviceContainer.gameInstanceService),
  new ParticipantInventoryController(serviceContainer.gameInstanceService),
  new GameEventController(serviceContainer.gameEventMongoClient, serviceContainer.gameInstanceMongoClient),
];
controllers.forEach(controller => serviceContainer.router.registerRoutes(controller, app));
serviceContainer.logger.debug('Registered controllers', {routes: serviceContainer.router.debugRoutes()});

// SPA fallback - serve index.html for all non-API routes
// This allows Angular router to handle client-side routing
const apiPrefix = serviceContainer.configuration.getConfig().apiPrefix;
app.use(spaFallbackMiddleware(staticPath, apiPrefix, serviceContainer.logger));

// Handle 404 - Unknown routes (primarily for API routes that don't exist)
app.use((req: express.Request, res: express.Response) => {
  serviceContainer.logger.warn('Route not found', { method: req.method, url: req.url, from: req.ip });
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.url}`,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  serviceContainer.logger.error('Unhandled error', { 
    error: err.message, 
    stack: err.stack, 
    method: req.method, 
    url: req.url 
  });
  
  if (res.headersSent) {
    return next(err);
  }
  
  res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

const server = app.listen(serviceContainer.configuration.getConfig().port, async () => {
  serviceContainer.logger.info(`Pagemaster API is running on port ${serviceContainer.configuration.getConfig().port}`);
  
  // Connect to MongoDB - single shared connection
  try {
    await serviceContainer.mongoConnection.connect();
    serviceContainer.logger.info('MongoDB connection established');
    
    // Initialize indexes for all collections
    await Promise.all([
      serviceContainer.gameInstanceMongoClient.initializeIndexes(),
      serviceContainer.gameEventMongoClient.initializeIndexes(),
    ]);
    serviceContainer.logger.info('Database indexes initialized');
    
    // Load fixtures
    await serviceContainer.gameInstanceFixture.initFirstGameSession();
    await serviceContainer.gameEventFixture.initGameEvents();
  } catch (error) {
    serviceContainer.logger.error('Failed to connect to MongoDB', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    process.exit(1);
  }
})

const io = new Server(server);
serviceContainer.socketServerService.init(io);



const shutdown = async () => {
  serviceContainer.logger.info('Received shutdown signal, closing server...');
  
  // Close MongoDB connection
  try {
    await serviceContainer.mongoConnection.disconnect();
    serviceContainer.logger.info('MongoDB connection closed');
  } catch (error) {
    serviceContainer.logger.error('Error closing MongoDB connection', { 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
  
  server.close(() => {
    serviceContainer.logger.info('Server closed. Exiting process.');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
