import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from 'src/config';
import { PostRepository, Post, postSchema } from './post.repository';
import { PostService } from './post.service';

@Module({
  imports: [
    MongooseModule.forRoot(config.db.url),
    MongooseModule.forFeature([{ name: Post.name, schema: postSchema }]),
  ],
  providers: [PostService, PostRepository],
  exports: [PostService],
})
export class PostModule {}
