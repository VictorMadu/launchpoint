import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    let responseBody: {
      errors: string[];
    };
    let httpStatus: number;

    if (exception instanceof HttpException) {
      responseBody = {
        errors: getErrorMessages(exception),
      };
      httpStatus = exception.getStatus();
    } else {
      responseBody = {
        errors: ['UNKNOWN_ERROR'],
      };
      httpStatus = 500;
      //TODO: Send to logging service since error is unknown;
      console.log('exception', exception);
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}

function getErrorMessages(exception: HttpException): string[] {
  const response = exception?.getResponse();
  console.log('getErrorMessages response', response);
  if (typeof response === 'string') return [response];
  else {
    const message = (response as any).message;
    if (Array.isArray(message)) return message;
    else return [message];
  }
}
