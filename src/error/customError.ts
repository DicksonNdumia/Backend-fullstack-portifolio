type ErrorData = { [key: string]: any }

export class CustomError extends Error {
  constructor(
    public message: string,
    public code: string | number = 'Internal_Error',
    public status: number = 500,
    public data: ErrorData = {},
  ) {
    super()
  }
}

export class RouteNotFoundError extends CustomError {
  constructor(originalUrl: string) {
    super(`Route '${originalUrl}' does not exist.`, 'Route_Not_Found', 404)
  }
}
export class BadUserInputError extends CustomError {
  constructor(errorData: ErrorData) {
    super('There were validation errors.', 'BAD_USER_INPUT', 400, errorData)
  }
}

export class InvalidTokenError extends CustomError {
  constructor(message = 'Authentication token is invalid.') {
    super(message, 'INVALID_TOKEN', 401)
  }
}

export class UserAlreadyExistsError extends CustomError {
  constructor() {
    super('User already exists. Please login.', 'USER_ALREADY_EXISTS', 409)
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message = 'Invalid email or password') {
    super(message, 'UNAUTHORIZED', 401)
  }
}

export class DatabaseError extends CustomError {
  constructor(message = 'Database operation failed') {
    super(message, 'DATABASE_ERROR', 500)
  }
}

export class NotFoundError extends CustomError {
  constructor(message = 'Resource not found') {
    super(message, 'NOT_FOUND', 404)
  }
}

export class ConflictError extends CustomError {
  constructor(message = 'Resource already exists') {
    super(message, 'CONFLICT', 409)
  }
}
