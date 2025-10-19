export abstract class HttpError extends Error {
  public abstract get httpStatusCode(): number;

  constructor(public message: string, public cause?: unknown) {
    super(message);
  }
}

export class HttpBadRequestError extends HttpError {
  public readonly httpStatusCode = 400;
}

export class HttpUnauthorizedError extends HttpError {
  public readonly httpStatusCode = 401;
}
export class HttpForbiddenError extends HttpError {
  public readonly httpStatusCode = 403;
}
export class HttpNotFoundError extends HttpError {
  public readonly httpStatusCode = 404;
}
export class HttpConflictError extends HttpError {
  public readonly httpStatusCode = 409;
}
export class HttpInternalServerError extends HttpError {
  public readonly httpStatusCode = 500;
}
export class HttpServiceUnavailableError extends HttpError {
  public readonly httpStatusCode = 503;
}
export class HttpNotImplementedError extends HttpError {
  public readonly httpStatusCode = 501;
}
export class HttpMethodNotAllowedError extends HttpError {
  public readonly httpStatusCode = 405;
}
export class HttpTooManyRequestsError extends HttpError {
  public readonly httpStatusCode = 429;
}