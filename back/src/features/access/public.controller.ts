import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import jwt from 'jsonwebtoken';
import { ConfigurationService } from '../../config/configuration.service';
import { Post } from '../../core/router/controller.decorators';
import { HttpUnauthorizedError } from '../../core/router/http-errors';

const RequestLoginBodySchema = {
  "type": "object",
  "properties": {
    "username": { "type": "string" },
    "password": { "type": "string" }
  },
  "required": ["username", "password"],
  "additionalProperties": false
} as const satisfies JSONSchema

type RequestLoginBody = FromSchema<typeof RequestLoginBodySchema>


export class PublicController {
  constructor(
    private configuration: ConfigurationService,
  ) {

  }

  @Post('/login', { jsonSchemaValidation: {
    body: RequestLoginBodySchema
  }})
  public login(body: RequestLoginBody): string | undefined {
    if (body.username !== this.configuration.getConfig().security.admin.username ||
        body.password !== this.configuration.getConfig().security.admin.password) {
      throw new HttpUnauthorizedError('Invalid username or password');
    }
    const token = jwt.sign({ username: body.username }, this.configuration.getConfig().security.jwt.secret);

    return token;
  }
}