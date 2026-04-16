// common/logger/logger.service.ts
import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import * as path from 'path';

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;

  constructor() {
    const logDir = path.join(process.cwd(), 'logs');

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      defaultMeta: { service: 'equip-assessment-api' },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, context, stack }) => {
              const contextStr = context ? `[${context}]` : '';
              const stackStr = stack ? `\n${stack}` : '';
              return `${timestamp} ${level} ${contextStr}: ${message}${stackStr}`;
            }),
          ),
        }),
        new winston.transports.DailyRotateFile({
          filename: path.join(logDir, 'error-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          maxFiles: '30d',
          maxSize: '20m',
        }),
        new winston.transports.DailyRotateFile({
          filename: path.join(logDir, 'combined-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          maxFiles: '30d',
          maxSize: '20m',
        }),
      ],
    });
  }

  log(message: string, context?: string) { this.logger.info(message, { context }); }
  error(message: string, trace?: string, context?: string) { this.logger.error(message, { context, stack: trace }); }
  warn(message: string, context?: string) { this.logger.warn(message, { context }); }
  debug(message: string, context?: string) { this.logger.debug(message, { context }); }
  verbose(message: string, context?: string) { this.logger.verbose(message, { context }); }

  // Custom Equip Platform Logging
  assessmentLog(assessmentId: string, action: string, recruiterId: string, details?: any) {
    this.logger.info(`Assessment ${action}`, { context: 'Assessment', assessmentId, recruiterId, details });
  }

  inviteLog(inviteId: string, action: string, email: string, details?: any) {
    this.logger.info(`Invite ${action}`, { context: 'Invite', inviteId, email, details });
  }

  attemptLog(attemptId: string, action: string, candidateId: string, details?: any) {
    this.logger.info(`Test Attempt ${action}`, { context: 'TestAttempt', attemptId, candidateId, details });
  }

  securityLog(action: string, userId: string, ip: string, details?: any) {
    this.logger.warn(`Security ${action}`, { context: 'Security', userId, ip, details });
  }
}