import { Module } from '@nestjs/common';
import { PostModule } from './post/post.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [UserModule, PostModule],
  exports: [UserModule, PostModule],
})
export class ServicesModule {}
