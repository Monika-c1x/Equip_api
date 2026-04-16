import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SUCCESS_MESSAGES } from '../constants';
import { GqlExecutionContext } from '@nestjs/graphql';

export interface Response<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const ctx = GqlExecutionContext.create(context);
    const operationName = ctx.getInfo().fieldName;
    
    return next.handle().pipe(
      map((data) => ({
        success: true,
        message: this.getMessage(operationName, data),
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }

  private getMessage(operationName: string, data: any): string {
    const operation = operationName.toLowerCase();
    
    if (operation.includes('create') || operation.includes('add')) {
      return SUCCESS_MESSAGES.CREATED;
    }
    
    if (operation.includes('update') || operation.includes('edit')) {
      return SUCCESS_MESSAGES.UPDATED;
    }
    
    if (operation.includes('delete') || operation.includes('remove')) {
      return SUCCESS_MESSAGES.DELETED;
    }
    
    return SUCCESS_MESSAGES.RETRIEVED;
  }
}