import winston from 'winston';
import { ConfigurationService } from '../config/configuration.service';
import { LogLevel, LogTransports } from '../config/configuration.types';


export class LoggerService {
  protected logger: winston.Logger;
  constructor(
    private config: ConfigurationService
  ) {
    this.logger = this.createLogger();
  }

  private createLogger() {
    const logger = winston.createLogger({
      level: this.config.getConfig().logger.level as LogLevel,
      format: winston.format.combine(
        winston.format.errors({ stack: true }),
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
          const result = {  t: timestamp, l: level.padEnd(6), m: message ? message : undefined, ...meta, s: stack }
          return JSON.stringify(result, null, 0).replace(/\\n/g, '\n');
        })
      ),
      transports: this.createTransport(this.config.getConfig().logger.transports),
    });

    return logger;
  }

  private createTransport(transports: LogTransports): winston.transport[] {
    const transportsResult: winston.transport[] = [];
    const consoleTransport = transports.find(t => t.type === 'console');
    if (consoleTransport) {
      transportsResult.push(new winston.transports.Console());
    }
    const fileTransport = transports.find(t => t.type === 'file');
    if (fileTransport) {
      transportsResult.push(new winston.transports.File({ filename: fileTransport.filename, level: fileTransport.logLevel }));
    }
    if (transports.length === 0) {
      transportsResult.push(new winston.transports.Console());
    }
    return transportsResult;
  }

  public info(message: string, ...args: unknown[]) {
    this.logger.info(message, ...args);
  }

  public warn(message: string, ...args: unknown[]) {
    this.logger.warn(message, ...args);
  }
  public error(message: string, ...args: unknown[]) {
    this.logger.error(message, ...args);
  }
  public debug(message: string, ...args: unknown[]) {
    this.logger.debug(message, ...args);
  }
  public verbose(message: string, ...args: unknown[]) {
    this.logger.verbose(message, ...args);
  }
  public silly(message: string, ...args: unknown[]) {
    this.logger.silly(message, ...args);
  }
  public log(level: string, message: string, ...args: unknown[]) {
    this.logger.log(level, message, ...args);
  }
}