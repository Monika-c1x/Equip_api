import { Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

@Catch(HttpException)
export class HttpExceptionFilter implements GqlExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
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
      default:
        return 'HTTP_ERROR';
    }
  }
}