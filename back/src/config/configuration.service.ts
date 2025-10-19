import Ajv from 'ajv';
import * as fs from 'fs';
import { Configuration, ConfigurationSchema, ENV_VARS } from './configuration.types';

export class ConfigurationServiceError extends Error {};



export class ConfigurationService {
  public static readonly DIR_CONFIG = 'configuration.json';
  public static readonly FILENAME_LOGS = 'logger.log';
  private config : Configuration | null = null;

  constructor(
    private schemaValidator: Ajv,
  ) {}

  private getEnvVars(): Record<ENV_VARS, string> {
    const envVars: Record<ENV_VARS, string> = {
      [ENV_VARS.MONGO_URI]: process.env[ENV_VARS.MONGO_URI] || '',
      [ENV_VARS.MONGO_DB]: process.env[ENV_VARS.MONGO_DB] || '',
      [ENV_VARS.STATIC_FILES_PATH]: process.env[ENV_VARS.STATIC_FILES_PATH] || '',
    };
    return envVars;
  }

  public init() {
    if (!fs.existsSync(ConfigurationService.DIR_CONFIG)) {
      throw new ConfigurationServiceError(`Configuration file not found: ${ConfigurationService.DIR_CONFIG}`);
    }
    const configTxt = fs.readFileSync(ConfigurationService.DIR_CONFIG, 'utf8');
    this.config = JSON.parse(configTxt) as Configuration;
    const validate = this.schemaValidator.compile(ConfigurationSchema);
    const valid = validate(this.config);
    if (!valid) {
      
      throw new ConfigurationServiceError(`Configuration validation failed: ${JSON.stringify(validate.errors, null, 2)}`);
    }
  }
  public getConfig(): Configuration {
    if (!this.config) {
      throw new ConfigurationServiceError('Configuration not initialized. Call init() first.');
    }
    return this.applyEnvVarsToConfig(this.config, this.getEnvVars());
  }

  private applyEnvVarsToConfig(config: Configuration, envVars: Record<ENV_VARS, string>): Configuration {
    const updatedConfig = structuredClone(config);
    updatedConfig.database.mongodb.url = envVars[ENV_VARS.MONGO_URI] || updatedConfig.database.mongodb.url;
    updatedConfig.database.mongodb.dbName = envVars[ENV_VARS.MONGO_DB] || updatedConfig.database.mongodb.dbName;
    updatedConfig.staticFilesPath = envVars[ENV_VARS.STATIC_FILES_PATH] || updatedConfig.staticFilesPath;
    return updatedConfig;
  }
}