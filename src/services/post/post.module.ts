import { Module } from '@nestjs/common';
import PostService from './post.service';

@Module({
  imports: [PostService],
})
export class PostModule {}
