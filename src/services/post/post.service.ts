import { Injectable } from '@nestjs/common';
import * as _ from 'lodash';
import Pagination from 'src/services/common/types/pagination';
import { ExactlyOne } from 'ts-util-types';
import { PostRepository } from './post.repository';

@Injectable()
export class PostService {
  constructor(private repository: PostRepository) {}

  async createPost(post: PostToBeCreated): Promise<Post> {
    const currentDate = new Date();

    const createdPost: Post = {
      ...post,
      createdAt: currentDate,
      lastUpdatedAt: currentDate,
    } as Post;
    const postId = await this.repository.insertOne(createdPost);

    createdPost.postId = postId;
    return createdPost;
  }

  async getPosts(pagination: Pagination): Promise<Post[]> {
    const posts = await this.repository.findMany(pagination);
    return _.map(posts, (post) => {
      return _.pick(post, [
        'postId',
        'creatorUserId',
        'title',
        'content',
        'createdAt',
        'lastUpdatedAt',
      ]);
    });
  }

  async getTotalPosts(): Promise<number> {
    return this.repository.getTotalActivePosts();
  }

  async updatePost(post: PostToBeUpdated): Promise<Post> {
    const currentDate = new Date();
    await this.repository.updateOne(post.postId, { ...post.updates, lastUpdatedAt: currentDate });
    const updatedPost = (await this.repository.findOneById(post.postId)) as Post;
    return _.pick(updatedPost, [
      'postId',
      'creatorUserId',
      'title',
      'content',
      'createdAt',
      'lastUpdatedAt',
    ]);
  }

  async deletePost(post: PostToBeDeleted): Promise<boolean> {
    const updatedColumnResult = await this.repository.deleteOne(post.postId);
    return updatedColumnResult.wasSuccessful();
  }

  async clearDb(): Promise<void> {
    await this.repository.clearDb();
  }
}

export interface Post {
  postId: string;
  creatorUserId: string;
  title: string;
  content: string;
  createdAt: Date;
  lastUpdatedAt: Date;
}

export interface PostToBeCreated {
  creatorUserId: string;
  title: string;
  content: string;
}

export interface PostToBeUpdated {
  postId: string;
  updates: ExactlyOne<{ title: string; content: string }>;
}

export interface PostToBeDeleted {
  postId: string;
}
