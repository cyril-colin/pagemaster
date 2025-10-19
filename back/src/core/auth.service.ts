import express from 'express';
import { expressjwt } from 'express-jwt';
import { ConfigurationService } from '../config/configuration.service';

export class AuthService {
  constructor(private readonly configuration: ConfigurationService) {}
  public getJWTMiddlware(): [string, express.RequestHandler] {
    const apiPrefix = this.configuration.getConfig().apiPrefix;
    const jwtMiddleware = expressjwt({ 
      secret: this.configuration.getConfig().security.jwt.secret, 
      algorithms: ["HS256"]
    }).unless({ path: [apiPrefix + '/login'] });
    
    return [apiPrefix, jwtMiddleware];
  }

  public getUnauthorizedHandler(): express.ErrorRequestHandler {
    return (err: Error, _req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (err.name === "UnauthorizedError") {
        res.status(401).json({ error: 'Invalid or missing token' }).end();
        return;
      } else {
        next(err);
      }
    };
  }
}