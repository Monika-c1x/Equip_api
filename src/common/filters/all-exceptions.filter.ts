import { Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { ERROR_MESSAGES } from '../constants';

@Catch()
export class AllExceptionsFilter implements GqlExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    const context = gqlHost.getContext();

    // Log the error
    this.logError(exception, context);

    // Convert to GraphQLError
    const graphQLError = this.convertToGraphQLError(exception);
    
    return graphQLError;
  }

  private logError(exception: unknown, context: any) {
    const request = context?.req;
    const timestamp = new Date().toISOString();
    const method = request?.method;
    const url = request?.url;
    const user = request?.user?.id || 'anonymous';

    console.error(`[${timestamp}] ${method} ${url} - User: ${user}`);
    console.error('Error:', exception);
  }

  private convertToGraphQLError(exception: unknown): GraphQLError {
    // Handle HttpException
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      const status = exception.getStatus();
      
      return new GraphQLError(
        typeof response === 'string' ? response : (response as any).message,
        {
          extensions: {
            code: this.getErrorCode(status),
            status,
            timestamp: new Date().toISOString(),
          },
        },
      );
    }

    // Handle GraphQLError
    if (exception instanceof GraphQLError) {
      return exception;
    }

    // Handle generic errors
    const error = exception as Error;
    return new GraphQLError(
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      {
        extensions: {
          code: 'INTERNAL_SERVER_ERROR',
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          timestamp: new Date().toISOString(),
        },
      },
    );
  }

  private getErrorCode(status: number): string {
    switch (status) {
      case 400:
        return 'BAD_REQUEST';
      case 401:
        return 'UNAUTHORIZED';
      case 403:
        return 'FORBIDDEN';
      case 404:
        return 'NOT_FOUND';
      case 409:
        return 'CONFLICT';
      case 422:
        return 'VALIDATION_FAILED';
      case 429:
        return 'TOO_MANY_REQUESTS';
      case 500:
        return 'INTERNAL_SERVER_ERROR';
      default:
        return 'UNKNOWN_ERROR';
    }
  }
}