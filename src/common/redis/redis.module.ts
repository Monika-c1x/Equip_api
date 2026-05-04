import { Module } from '@nestjs/common';
import Redis from 'ioredis';

export const REDIS_HOST = 'REDIS_HOST';
export const REDIS_PORT = 'REDIS_PORT';
export const REDIS_PASSWORD = 'REDIS_PASSWORD';
export const REDIS_DB = 'REDIS_DB';

export const redisProvider = {
  provide: 'REDIS',
  useFactory: () => {
    return new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_DB || '0'),
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });
  },
};

@Module({
  providers: [redisProvider],
  exports: [redisProvider],
})
export class RedisModule {}
