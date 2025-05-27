import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { Prisma } from 'generated/prisma';
import { MulterError } from 'multer';

@Catch()
export class GlobalErrorHandlerFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (!exception) {
      Logger.error('Caught undefined exception!');
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Unknown error occurred',
        path: request?.url || 'unknown',
        method: request?.method || 'unknown',
      });
      return;
    }

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string = 'Internal server error';
    let errorDetails: string | Record<string, unknown> | undefined = undefined;

    // 📦 Handle HttpException and BadRequestException
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (exception instanceof BadRequestException) {
        const res = exceptionResponse as
          | { message: string | string[]; error?: string }
          | string;

        if (typeof res === 'string') {
          message = res;
        } else if (typeof res.message === 'string') {
          message = res.message;
        } else if (Array.isArray(res.message)) {
          message = res.message[0];
        } else {
          message = res.error || 'Bad Request';
        }
      } else {
        message =
          typeof exceptionResponse === 'string'
            ? exceptionResponse
            : (exceptionResponse as any)?.message || 'Http Exception occurred';
      }
    }

    // ⚠️ Handle Multer file upload errors
    if (exception instanceof MulterError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'File upload error: ' + exception.message;
      errorDetails = exception.code;
    }

    // ⚠️ Handle file filter rejection (e.g., unsupported file types)
    if (exception instanceof Error && exception.message?.startsWith('Unsupported file type')) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
    }

    // 🧩 Prisma-specific error handling
    if (exception instanceof Prisma.PrismaClientValidationError) {
      message = 'Validation Error';
      errorDetails = exception.message;
      status = HttpStatus.BAD_REQUEST;
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        message = 'Duplicate Key Error';
        errorDetails = exception.meta ?? undefined;
        status = HttpStatus.BAD_REQUEST;
      }
    }

    response.status(status).json({
      success: false,
      message,
      statusCode: status,
      errorDetails,
      path: request?.url || 'unknown',
      method: request?.method || 'unknown',
    });

    Logger.error(
      `Exception caught at ${request.method} ${request.url}`,
      exception,
    );
  }
}
