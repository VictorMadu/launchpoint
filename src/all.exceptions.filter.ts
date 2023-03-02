import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    let responseBody: {
      statusCode: HttpStatus;
      message: string;
      error?: Error | string;
    };

    if (exception instanceof HttpException) {
      responseBody = {
        statusCode: exception.getStatus(),
        message: exception.message,
        error: exception.cause,
      };
    } else {
      responseBody = {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal Server Error',
        error: 'Internal Server Error',
      };
      //TODO: Send to logging service since error is unknown;
      console.log('exception', exception);
    }

    const httpStatus = responseBody.statusCode;
    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
