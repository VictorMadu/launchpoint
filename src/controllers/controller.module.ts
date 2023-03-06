import { Module } from '@nestjs/common';
import { UserService } from 'src/services/user/user.service';
import { PostService } from 'src/services/post/post.service';
import { RestController } from './rest.controller';

@Module({
  imports: [UserService, PostService],
  providers: [RestController],
})
export class ControllerModule {}
