import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  // Database Configuration
  get databaseHost(): string {
    return this.configService.get<string>('DB_HOST', 'localhost');
  }

  get databasePort(): number {
    return this.configService.get<number>('DB_PORT', 3306);
  }

  get databaseUser(): string {
    return this.configService.get<string>('DB_USER', 'root');
  }

  get databasePassword(): string {
    return this.configService.get<string>('DB_PASSWORD', 'password');
  }

  get databaseName(): string {
    return this.configService.get<string>('DB_NAME', 'equip_platform');
  }

  // Redis Configuration
  get redisHost(): string {
    return this.configService.get<string>('REDIS_HOST', 'localhost');
  }

  get redisPort(): number {
    return this.configService.get<number>('REDIS_PORT', 6379);
  }

  get redisPassword(): string | undefined {
    return this.configService.get<string>('REDIS_PASSWORD');
  }

  get redisDb(): number {
    return this.configService.get<number>('REDIS_DB', 0);
  }

  // JWT Configuration
  get jwtSecret(): string {
    return this.configService.get<string>(
      'JWT_SECRET',
      'your-secret-key-change-in-production',
    );
  }

  get jwtExpiresIn(): string {
    return this.configService.get<string>('JWT_EXPIRES_IN', '7d');
  }

  // Email Configuration
  get smtpHost(): string {
    return this.configService.get<string>('SMTP_HOST', 'localhost');
  }

  get smtpPort(): number {
    return this.configService.get<number>('SMTP_PORT', 587);
  }

  get smtpUser(): string {
    return this.configService.get<string>('SMTP_USER', '');
  }

  get smtpPassword(): string {
    return this.configService.get<string>('SMTP_PASS', '');
  }

  get smtpFrom(): string {
    return this.configService.get<string>(
      'SMTP_FROM',
      'noreply@equip-platform.com',
    );
  }

  get smtpSecure(): boolean {
    return this.configService.get<string>('SMTP_SECURE', 'false') === 'true';
  }

  // Frontend Configuration
  get frontendUrl(): string {
    return this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
  }

  get backendUrl(): string {
    return this.configService.get<string>(
      'BACKEND_URL',
      'http://localhost:3001',
    );
  }

  // Node Environment
  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV', 'development');
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  // API Configuration
  get apiPort(): number {
    return this.configService.get<number>('API_PORT', 3001);
  }

  get apiVersion(): string {
    return this.configService.get<string>('API_VERSION', 'v1');
  }

  // OTP Configuration
  get otpMaxAttempts(): number {
    return this.configService.get<number>('OTP_ATTEMPTS', 3);
  }

  get otpTtlMinutes(): number {
    return this.configService.get<number>('OTP_TTL_MINUTES', 5);
  }

  get otpTtlSeconds(): number {
    return this.otpTtlMinutes * 60;
  }

  // Validation
  validateRequiredConfig(): string[] {
    const errors: string[] = [];

    if (!this.smtpUser) {
      errors.push('SMTP_USER is required for email functionality');
    }

    if (!this.smtpPassword) {
      errors.push('SMTP_PASS is required for email functionality');
    }

    if (!this.jwtSecret || this.jwtSecret.length < 32) {
      errors.push('JWT_SECRET is required and must be at least 32 characters');
    }

    return errors;
  }
}
