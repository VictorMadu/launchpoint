import { Module } from '@nestjs/common';
import { UserService } from 'src/services/user/user.service';
import { PostService } from 'src/services/post/post.service';
import { RestController } from './rest.controller';
import { ServicesModule } from 'src/services/services.module';

@Module({
  imports: [ServicesModule],
  controllers: [RestController],
})
export class ControllerModule {}
