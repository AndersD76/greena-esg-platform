import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('❌ Erro:', err);

  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Erro de validação',
      details: err.message,
    });
  }

  return res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
};
