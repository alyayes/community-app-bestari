export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} tidak ditemukan`, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Akses tidak diizinkan') {
    super(message, 401);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Data tidak valid') {
    super(message, 400);
  }
}
