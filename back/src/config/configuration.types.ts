import { JSONSchema } from 'json-schema-to-ts';

export enum ENV_VARS {
  MONGO_URI = "MONGO_URI",
  STATIC_FILES_PATH = "STATIC_FILES_PATH",
  MONGO_DB = "MONGO_DB"
}

export type LogLevel = "error" | "warn" | "info" | "debug" | "verbose" | "silly";

export type LogTransport =
  | { type: "console", }
  | { type: "file", filename: string, logLevel: LogLevel };

export type LogTransportLabel = LogTransport['type'];
export type LogTransports = LogTransport[];

export const TORRENT_CATEGORIES = [ "films", "series" ] as const;
export type TorrentCategory = typeof TORRENT_CATEGORIES[number];

export type Configuration = {
  port: number,
  host: string,
  apiPrefix: string,
  staticFilesPath: string,
  cors: {
    allowedOrigins: string[],
    allowedMethods: string[],
  },
  database: {
    mongodb: {
      url: string,
      dbName: string,
    }
  },
  logger: {
    /**
     * The log level for the logger, displayed in the console
     */
    level: LogLevel,
    transports: LogTransports,
  }
}

export const ConfigurationSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Configuration Schema",
  "type": "object",
  "properties": {
    "port": { "type": "integer" },
    "host": { "type": "string" },
    "apiPrefix": { "type": "string" },
    "staticFilesPath": { "type": "string" },
    "cors": {
      "type": "object",
      "properties": {
        "allowedOrigins": {
          "type": "array",
          "items": { "type": "string" }
        },
        "allowedMethods": {
          "type": "array",
          "items": { "type": "string" }
        }
      },
      "required": ["allowedOrigins", "allowedMethods"],
      "additionalProperties": false
    },
    "database": {
      "type": "object",
      "properties": {
        "mongodb": {
          "type": "object",
          "properties": {
            "url": { "type": "string" },
            "dbName": { "type": "string" }
          },
          "required": ["url", "dbName"],
          "additionalProperties": false
        }
      },
      "required": ["mongodb"],
      "additionalProperties": false
    },
    "logger": {
      "type": "object",
      "properties": {
        "level": {
          "type": "string",
          "enum": ["error", "warn", "info", "debug", "verbose", "silly"]
        },
        "transports": {
          "type": "array",
          "items": {
            "oneOf": [
              {
                "type": "object",
                "properties": {
                  "type": { "const": "console" }
                },
                "required": ["type"],
                "additionalProperties": false
              },
              {
                "type": "object",
                "properties": {
                  "type": { "const": "file" },
                  "filename": { "type": "string" },
                  "logLevel": {
                    "type": "string",
                    "enum": ["error", "warn", "info", "debug", "verbose", "silly"]
                  }
                },
                "required": ["type", "filename", "logLevel"],
                "additionalProperties": false
              }
            ]
          }
        }
      },
      "required": ["level", "transports"],
      "additionalProperties": false
    }
  },
  "required": ["port", "host", "apiPrefix", "staticFilesPath", "cors", "database", "logger"],
  "additionalProperties": false
} as const satisfies JSONSchema;
