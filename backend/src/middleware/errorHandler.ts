import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { errorResponse } from '../utils/response';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(`[ERROR] ${err.message}`, err.stack);

  if (err instanceof AppError) {
    return errorResponse(res, err.message, err.statusCode);
  }

  if ((err as any).type === 'entity.too.large') {
    return errorResponse(res, 'Ukuran file terlalu besar. Maksimal 50MB.', 413);
  }

  // Prisma errors
  if (err.constructor?.name === 'PrismaClientKnownRequestError') {
    const prismaErr = err as any;
    if (prismaErr.code === 'P2002') {
      return errorResponse(res, 'Data sudah ada (duplikat)', 409);
    }
    if (prismaErr.code === 'P2025') {
      return errorResponse(res, 'Data tidak ditemukan', 404);
    }
  }

  // Default
  return errorResponse(res, 'Terjadi kesalahan server', 500);
};
