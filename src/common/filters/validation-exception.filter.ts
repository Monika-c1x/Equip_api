import { Catch, ArgumentsHost, BadRequestException } from '@nestjs/common';
import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements GqlExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    const response = exception.getResponse();
    
    let message = 'Validation failed';
    let errors: any[] = [];

    if (typeof response === 'object' && response !== null) {
      const res = response as any;
      message = res.message || message;
      errors = this.extractValidationErrors(res);
    }

    return new GraphQLError(message, {
      extensions: {
        code: 'VALIDATION_FAILED',
        status: 422,
        timestamp: new Date().toISOString(),
        errors,
      },
    });
  }

  private extractValidationErrors(response: any): any[] {
    if (Array.isArray(response.message)) {
      return response.message.map((error: any) => ({
        field: error.property,
        constraints: error.constraints,
        value: error.value,
      }));
    }

    if (response.errors) {
      return response.errors;
    }

    return [];
  }
}