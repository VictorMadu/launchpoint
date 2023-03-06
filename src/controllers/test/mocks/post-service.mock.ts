import Pagination from 'src/services/common/types/pagination';
import {
  Post,
  PostQueryResult,
  PostToBeDeleted,
  PostToBeUpdated,
} from 'src/services/post/post.service';
import { PostToBeCreated } from 'src/services/post/post.service';
import { PostServiceData } from './post-service.data';

export class PostServiceMock {
  constructor(private postServiceData: PostServiceData) {}

  async createPost(post: PostToBeCreated): Promise<Post> {
    const currentTime = new Date();
    return {
      ...post,
      postId: this.postServiceData.generateId(),
      createdAt: currentTime,
      lastUpdatedAt: currentTime,
    };
  }

  async getPosts(pagination: Pagination): Promise<Post[]> {
    const posts = this.postServiceData.getAllPosts();
    return posts.slice(pagination.offset, pagination.offset + pagination.limit);
  }

  async getTotalPosts() {
    const posts = this.postServiceData.getAllPosts();
    return posts.length;
  }

  async updatePost(updateDetails: PostToBeUpdated): Promise<Post> {
    const post = this.postServiceData.getPostById(updateDetails.postId);
    return {
      ...post,
      ...updateDetails.updates,
    };
  }

  async getPostById(postId: string): Promise<PostQueryResult> {
    const post = this.postServiceData.getPostById(postId);
    if (post == null) {
      return { isFound: () => false, getData: () => null };
    } else {
      return { isFound: () => true, getData: () => post };
    }
  }

  async deletePost(deleteDetails: PostToBeDeleted) {
    const post = this.postServiceData.getPostById(deleteDetails.postId);
    if (post == null) {
      return false;
    } else {
      return true;
    }
  }

  async clearDb() {
    return;
  }
}
