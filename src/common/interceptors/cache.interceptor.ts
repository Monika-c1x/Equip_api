import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { map, Observable, of } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

// Simple in-memory cache (replace with Redis in production)
const cache = new Map<string, { data: any; expiry: number }>();

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = GqlExecutionContext.create(context);
    const cacheControl = this.reflector.get<{ maxAge: number }>('cacheControl', context.getHandler());
    
    if (!cacheControl) {
      return next.handle();
    }

    const cacheKey = this.getCacheKey(ctx);
    const cached = cache.get(cacheKey);

    if (cached && cached.expiry > Date.now()) {
      return of(cached.data);
    }

    return next.handle().pipe(
      map((data) => {
        cache.set(cacheKey, {
          data,
          expiry: Date.now() + cacheControl.maxAge * 1000,
        });
        return data;
      }),
    );
  }

  private getCacheKey(ctx: GqlExecutionContext): string {
    const req = ctx.getContext().req;
    const operationName = ctx.getInfo().fieldName;
    const args = JSON.stringify(ctx.getArgs());
    const user = req?.user?.id || 'anonymous';
    
    return `${operationName}:${user}:${args}`;
  }
}

// Clear cache utility
export function clearCache(pattern?: string) {
  if (!pattern) {
    cache.clear();
    return;
  }

  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
}