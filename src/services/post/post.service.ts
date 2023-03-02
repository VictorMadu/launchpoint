import Pagination from 'src/services/common/types/pagination';

export default class PostService {
  async createPost(post: PostToBeCreated): Promise<Post> {
    throw new Error();
  }

  async getPosts(pagination: Pagination): Promise<Post[]> {
    throw new Error();
  }

  async getTotalPosts(): Promise<number> {
    throw new Error();
  }

  async updatePost(post: PostToBeUpdated): Promise<Post> {
    throw new Error();
  }

  async deletePost(post: PostToBeDeleted): Promise<boolean> {
    throw new Error();
  }

  async clearDb(): Promise<void> {
    throw new Error();
  }
}

export interface Post {
  creatorUserId: string;
  postId: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostToBeCreated {
  userId: string;
  title: string;
  content: string;
}

export interface PostToBeUpdated {
  postId: string;
  title: string;
  content: string;
}

export interface PostToBeDeleted {
  postId: string;
}
