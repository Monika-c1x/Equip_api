import { SetMetadata, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';


// Role-based access control decorator
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

// Public endpoint decorator (skip auth)
export const Public = () => SetMetadata('isPublic', true);

// Current user decorator for GraphQL
export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.user;
  },
);

// Current user ID decorator
export const CurrentUserId = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.user?.id;
  },
);

// Current user role decorator
export const CurrentUserRole = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.user?.role;
  },
);

// Pagination decorator
export const Pagination = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const args = ctx.getArgs();
    return {
      page: args.page || 1,
      limit: args.limit || 20,
      skip: ((args.page || 1) - 1) * (args.limit || 20),
    };
  },
);

// File upload decorator
export const FileUpload = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.file;
  },
);

// Multiple files upload decorator
export const FilesUpload = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.files;
  },
);

// Validation groups decorator
export const ValidationGroups = (...groups: string[]) => 
  SetMetadata('validationGroups', groups);

// Cache control decorator
export const CacheControl = (maxAge: number) => 
  SetMetadata('cacheControl', { maxAge });