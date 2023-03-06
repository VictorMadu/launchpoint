import { Module, ValidationPipe } from '@nestjs/common';
import { RestController } from './rest.controller';
import { ServicesModule } from 'src/services/services.module';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { AllExceptionsFilter } from './all.exceptions.filter';

@Module({
  imports: [ServicesModule],
  controllers: [RestController],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        forbidUnknownValues: false,
        transform: true,
      }),
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class ControllerModule {}
