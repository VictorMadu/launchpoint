import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from 'src/config';
import { PostModule } from './post/post.module';

@Module({
  imports: [PostModule],
})
export class ServicesModule {}
