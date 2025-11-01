import Ajv from 'ajv';
import express from 'express';
import { JSONSchema } from 'json-schema-to-ts';
import { LoggerService } from '../logger.service';
import { HttpBadRequestError, HttpError } from './http-errors';

export type RouteDefinition = {
  path: string;
  requestMethod: 'get' | 'post' | 'put' | 'delete' | 'patch';
  methodName: string;
  options?: {
    withoutApiPrefix?: boolean;
    skipAutomaticResponse?: boolean;
    skipBodyLogging?: boolean;
    jsonSchemaValidation?: {
        body?: JSONSchema,
        params?: JSONSchema,
        query?: JSONSchema
    }
  }
};

export class Router {
  private readonly RouteRegistry = new Map<unknown, RouteDefinition[]>();
  constructor(
    private logger: LoggerService,
    private schemaValidator: Ajv,
  ) {}


  addRoute(
    target: {constructor: {name: string}},
    path: string,
    requestMethod: 'get' | 'post' | 'put' | 'delete' | 'patch',
    methodName: string,
    options?: RouteDefinition['options']
  ) {
    const routes = this.RouteRegistry.get(target.constructor) || [];
    routes.push({ path, requestMethod: requestMethod as  "get" | "post" | "put" | "delete" | "patch", methodName, options });
    this.RouteRegistry.set(target.constructor, routes);
  }

  debugRoutes(): string {
    const indent = (level: number) => ''.padStart(level * 10, ' ');
    const result = Array.from(this.RouteRegistry.entries()).map(([controller, routes]) => {
      const controllerName = (controller as { name: string }).name;
      const routesStr = routes.map(route => `${indent(2)}${route.requestMethod.toUpperCase()} ${route.path}`).join('\n');
      return `${indent(1)}${controllerName}\n${routesStr}`;
    }).join('\n');
    return `\n${result}`;
  }


  registerRoutes<T extends { constructor: { name: string } }>(instance: T, app: express.Application) {
    const routes = this.RouteRegistry.get(instance.constructor);
    if (routes) {
      for (const route of routes) {
        const methodName = route.methodName as keyof T; 
        app[route.requestMethod](route.path, async (req: express.Request, res: express.Response) => {
          
          try {
            if (route.options?.jsonSchemaValidation) {
              const errors = this.getRequestValidationErrors(req, route.options);
              if (errors.body.length > 0 || errors.params.length > 0 || errors.query.length > 0) {
                throw new HttpBadRequestError('Invalid request data', errors);
              }
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
            const result = await (instance[methodName] as Function)(req.body, req.params, req.query, req, res);
            if (route.options?.skipAutomaticResponse) {
              return;
            }
            res.setHeader('Content-Type', 'application/json').status(200).json(result).end();
          } catch (error) {
            this.catchControllerError(error, req, res, methodName as string, instance);
          }
        });

        this.logger.debug(`Routes for ${instance.constructor.name} registered`);
      }
    } else {
      this.logger.warn(`No routes found for ${instance.constructor.name}`);
    }
  }

  private catchControllerError(
    error: unknown,
    req: express.Request,
    res: express.Response,
    methodName: string,
    instance: { constructor: { name: string } }
  ) {
    if (error instanceof HttpError) {
      this.logger.error(`API Error`, {
        error: error.message,
        httpStatusCode: error.httpStatusCode,
        method: req.method,
        path: req.path,
        body: this.hideCredentials(req.body),
        params: req.params,
        query: req.query,
        handler: `${instance.constructor.name}.${methodName}`,
        cause: error.cause,
      });
      res.status(error.httpStatusCode).json({ error: error.message, cause: error.cause }).end();
    } else {
      let errorMessage = error instanceof Error ? `${error.message} | ${error.stack}` : String(error);
      errorMessage = errorMessage.replace(/\\n/g, '\n');
      
      this.logger.error('Error occurred while processing request', {
         method: req.method,
         path: req.path,
         handler: `${instance.constructor.name}.${methodName}`,
         error: errorMessage,
      });
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error' }).end();
      }
    }

  }

  private getRequestValidationErrors(req: express.Request, routeDef: RouteDefinition['options']) {
    const errors = {
      body: this.validateClientInput(routeDef?.jsonSchemaValidation?.body || {}, req.body),
      params: this.validateClientInput(routeDef?.jsonSchemaValidation?.params || {}, req.params),
      query: this.validateClientInput(routeDef?.jsonSchemaValidation?.query || {}, req.query)
    };
    return errors;
  }

  private validateClientInput(schema: JSONSchema, object: unknown) {
    const validate = this.schemaValidator.compile(schema);
    validate(object);
    return validate.errors ?? [];
  }



  private hideCredentials(body: {username?: string, password?: string}): unknown {
    if (!body) {
      return;
    }
    const clone = { ...body };
    if (body.username) {
      clone.username = '[hidden]';
    }
    if (body.password) {
      clone.password = '[hidden]';
    }
    return clone;
  }
}