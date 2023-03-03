import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from 'src/config';
import { UserService } from './user.service';

@Module({
  imports: [
    // MongooseModule.forRoot(config.db.url),
    // MongooseModule.forFeature([{ name: Post.name, schema: postSchema }]),
  ],
  providers: [UserService],
})
export class UserModule {}
