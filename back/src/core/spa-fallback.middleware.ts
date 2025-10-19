import express from 'express';
import path from 'path';
import { LoggerService } from './logger.service';

/**
 * SPA (Single Page Application) fallback middleware.
 * 
 * This middleware serves the index.html file for any GET requests that:
 * - Don't match API routes
 * - Don't match static files (handled by express.static before this middleware)
 * 
 * This allows client-side routers (like Angular Router) to handle navigation.
 * 
 * @param staticPath - The absolute or relative path to the static files directory
 * @param apiPrefix - The API route prefix (e.g., '/api')
 * @param logger - Logger service for error reporting
 * @returns Express middleware function
 */
export function spaFallbackMiddleware(
  staticPath: string | undefined,
  apiPrefix: string,
  logger: LoggerService
): express.RequestHandler {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Only handle GET requests for SPA fallback
    if (req.method !== 'GET') {
      return next();
    }
    
    // Only fallback to index.html for non-API routes
    if (req.url.startsWith(apiPrefix)) {
      return next(); // Let the 404 handler deal with unknown API routes
    }
    
    // Check if static file exists, if not serve index.html for SPA routing
    if (staticPath) {
      const indexPath = path.resolve(staticPath, 'index.html');
      res.sendFile(indexPath, (err) => {
        if (err) {
          logger.error('Failed to serve index.html', { error: err.message, url: req.url });
          next(err);
        }
      });
    } else {
      next(); // No static path configured, continue to 404
    }
  };
}
