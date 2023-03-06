import mongoose from 'mongoose';
import * as _ from 'lodash';
import { Post } from 'src/services/post/post.service';

export class PostServiceData {
  getPostById(postId: string) {
    const post: Post | undefined = postStore.postIdIndex[postId];
    return post;
  }

  getAllPosts() {
    return postStore.posts;
  }

  generateId() {
    return new mongoose.Types.ObjectId().toString();
  }
}

const noOfUsers = 2;
const noOfPosts = 10;

const postStore = {
  postIdIndex: {} as Record<string, Post>,
  posts: new Array(noOfPosts) as Post[],
};

const creatorUserIds = _.map(_.range(noOfUsers), () => new mongoose.Types.ObjectId().toString());

_.forEach(_.range(noOfPosts), (index) => {
  const post: Post = {
    postId: new mongoose.Types.ObjectId().toString(),
    creatorUserId: creatorUserIds[index % creatorUserIds.length],
    title: `Title ${index}`,
    content: `Content ${index}`,
    createdAt: new Date(new Date().getTime() - index * 1000),
    lastUpdatedAt: new Date(new Date().getTime() - index * 2000),
  };

  postStore.postIdIndex[post.postId] = post;
  postStore.posts[index] = post;
});
