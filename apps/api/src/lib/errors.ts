export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export const Errors = {
  NotFound: (resource: string) => new AppError('NOT_FOUND', 404, `${resource} not found`),
  Unauthorized: (msg = 'Authentication required') => new AppError('UNAUTHORIZED', 401, msg),
  Forbidden: (msg = 'Access denied') => new AppError('FORBIDDEN', 403, msg),
  Conflict: (msg: string) => new AppError('CONFLICT', 409, msg),
  BadRequest: (msg: string, details?: unknown) => new AppError('BAD_REQUEST', 400, msg, details),
  UnprocessableEntity: (msg: string, details?: unknown) =>
    new AppError('UNPROCESSABLE_ENTITY', 422, msg, details),
  InternalError: (msg = 'Internal server error') => new AppError('INTERNAL_ERROR', 500, msg),
  PaymentFailed: (msg: string) => new AppError('PAYMENT_FAILED', 402, msg),
  Blocked: () => new AppError('USER_BLOCKED', 403, 'Your account has been suspended. Contact support.'),
}
