import express from 'express';
import { Server } from 'socket.io';
import { serviceContainer } from './dependency-container';
import { PublicController } from './features/access/public.controller';
import { GameDefController } from './features/gamedef/gamedef.controller';
import { GameInstanceController } from './features/gameinstance/game-instance.controller';

const app = express();

// Custom CORS middleware - handles both simple and preflight requests
app.use((req: express.Request, res: express.Response, next: express.NextFunction): void => {
  const config = serviceContainer.configuration.getConfig();
  
  // Set CORS headers
  res.appendHeader('source', 'Pagemaster API');
  
  const allowedOrigins = config.cors.allowedOrigins.join(', ');
  const allowedMethods = config.cors.allowedMethods.join(', ');
  const isWildcardOrigin = config.cors.allowedOrigins.includes('*');
  const isWildcardMethods = config.cors.allowedMethods.includes('*');
  
    res.header('Access-Control-Allow-Origin', allowedOrigins);
    res.header('Access-Control-Allow-Methods', allowedMethods);
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, current-participant-id');
  
  // Only set credentials to true if we're not using wildcards
  // Browsers reject wildcard + credentials combination for security
  if (!isWildcardOrigin && !isWildcardMethods) {
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  
  res.header('Access-Control-Max-Age', '86400'); // Cache preflight for 24 hours
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    serviceContainer.logger.debug('access CORS preflight', { url: req.url, from: req.ip });
    res.status(200).end();
    return;
  }
  
  serviceContainer.logger.debug('access', { method: req.method.padEnd(6), url: req.url, from: req.ip });
  next();
});

app.use(express.json());
// app.use(...serviceContainer.authService.getJWTMiddlware());
// app.use(serviceContainer.authService.getUnauthorizedHandler());


const controllers = [
  new PublicController(serviceContainer.configuration),
  new GameDefController(serviceContainer.mongoClient),
  new GameInstanceController(serviceContainer.mongoClient, serviceContainer.socketServerService),
];
controllers.forEach(controller => serviceContainer.router.registerRoutes(controller, app));
serviceContainer.logger.debug('Registered controllers', {routes: serviceContainer.router.debugRoutes()});

// Handle 404 - Unknown routes
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
  
  // Connect to MongoDB
  try {
    await serviceContainer.mongoClient.connect();
    await serviceContainer.mongoClient.initializeDatabase();
    serviceContainer.logger.info('MongoDB connection established and database initialized');
  } catch (error) {
    serviceContainer.logger.error('Failed to connect to MongoDB', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    process.exit(1);
  }
})

const config = serviceContainer.configuration.getConfig();
const io = new Server(server, {
  cors: {
    origin: config.cors.allowedOrigins.includes('*') ? true : config.cors.allowedOrigins,
    methods: config.cors.allowedMethods.includes('*') ? ["GET", "POST"] : config.cors.allowedMethods,
    credentials: !config.cors.allowedOrigins.includes('*') && !config.cors.allowedMethods.includes('*')
  }
});
serviceContainer.socketServerService.init(io);



const shutdown = async () => {
  serviceContainer.logger.info('Received shutdown signal, closing server...');
  
  // Close MongoDB connection
  try {
    await serviceContainer.mongoClient.disconnect();
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
