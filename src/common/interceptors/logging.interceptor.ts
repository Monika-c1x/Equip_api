import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    const operationName = ctx.getInfo().fieldName;
    const now = Date.now();

    const user = req?.user?.id || 'anonymous';
    const ip = req?.ip || req?.connection?.remoteAddress || 'unknown';

    console.log(`[GraphQL] ${operationName} - User: ${user} - IP: ${ip} - Start`);

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - now;
        console.log(`[GraphQL] ${operationName} - Completed in ${duration}ms`);
      }),
    );
  }
}