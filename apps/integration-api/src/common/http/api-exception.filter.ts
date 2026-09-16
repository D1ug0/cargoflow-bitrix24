import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const details = exception instanceof HttpException ? exception.getResponse() : undefined;

    if (status >= 500) {
      console.error(
        JSON.stringify({
          level: 'error',
          correlationId: request.correlationId,
          path: request.url,
          error: exception instanceof Error ? exception.message : 'Unknown error',
        }),
      );
    }

    response.status(status).json({
      statusCode: status,
      code: this.codeFor(status),
      message: this.publicMessage(status, details),
      correlationId: request.correlationId,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private publicMessage(status: number, details: string | object | undefined): string | string[] {
    if (status >= 500) return 'Внутренняя ошибка сервиса';
    if (typeof details === 'string') return details;
    if (details && 'message' in details) {
      const message = (details as { message: unknown }).message;
      if (typeof message === 'string' || Array.isArray(message))
        return message as string | string[];
    }
    return 'Запрос не выполнен';
  }

  private codeFor(status: number) {
    const codes: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      503: 'SERVICE_UNAVAILABLE',
    };
    return codes[status] ?? 'INTERNAL_ERROR';
  }
}
