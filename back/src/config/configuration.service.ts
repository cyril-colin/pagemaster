import Ajv from 'ajv';
import * as fs from 'fs';
import { Configuration, ConfigurationSchema } from './configuration.types';

export class ConfigurationServiceError extends Error {};



export class ConfigurationService {
  public static readonly DIR_CONFIG = 'configuration.json';
  public static readonly FILENAME_LOGS = 'logger.log';
  private config : Configuration | null = null;

  constructor(
    private schemaValidator: Ajv,
  ) {}

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
    return this.config;
  }
}