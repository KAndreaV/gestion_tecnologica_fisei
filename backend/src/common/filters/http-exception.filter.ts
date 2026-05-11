import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Filtro global para manejo de excepciones HTTP
 * Estandariza las respuestas de error en toda la aplicación
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Construir respuesta estandarizada
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message:
        typeof exceptionResponse === 'object' &&
        'message' in exceptionResponse
          ? (exceptionResponse as any).message
          : exception.message,
      ...(status >= 400 && status < 500 && {
        details:
          typeof exceptionResponse === 'object' &&
          'error' in exceptionResponse
            ? (exceptionResponse as any).error
            : undefined,
      }),
    };

    // Log de errores
    this.logger.error(
      `${request.method} ${request.url} - ${status}`,
      exception.stack,
    );

    // Enviar respuesta
    response.status(status).json(errorResponse);
  }
}
