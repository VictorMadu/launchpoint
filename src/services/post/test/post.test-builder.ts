import * as _ from 'lodash';
import PostService, { Post } from '../post.service';
import { transformDateToMs } from 'src/services/common/date-to-ms';
import Pagination from 'src/services/common/types/pagination';

export class WhenStartingFromOriginTestBuilder {
  private posts: any[];
  private postLength: number;

  async setUp(postService: PostService) {
    this.posts = await postService.getPosts({ offset: 0, limit: 10 });
    this.postLength = await postService.getTotalPosts();
  }

  getActualPosts() {
    return this.posts;
  }

  getExpectedPosts() {
    return [];
  }

  getActualTotalPosts() {
    return this.postLength;
  }

  getExpectedTotalPosts() {
    return 0;
  }
}

export class WhenPostIsCreatedTestBuilder {
  private post: any;
  private postLength: number;

  constructor(private expect: jest.Expect) {}

  async setUp(postService: PostService) {
    this.post = await postService.createPost(posts[0]);
    this.postLength = await postService.getTotalPosts();
  }

  getActualPost() {
    return this.post;
  }

  getExpectedPost() {
    return {
      ...posts[0],
      createdAt: this.expect.any(Date),
      lastUpdatedAt: this.expect.any(Date),
    };
  }

  getActualTotalPosts() {
    return this.postLength;
  }

  getExpectedTotalPosts() {
    return 1;
  }
}

export class WhenDatabaseIsClearedAfterCreatedTestBuilder {
  private postLength: number;

  async setUp(postService: PostService) {
    await postService.createPost(posts[0]);
    await postService.clearDb();
    this.postLength = await postService.getTotalPosts();
  }

  getActualTotalPosts() {
    return this.postLength;
  }

  getExpectedTotalPosts() {
    return 0;
  }
}

export class WhenSequenceOfPostAreCreatedTestBuilder {
  private timeCreationStartedInMs: number | null = null;
  private timeCreationEndedInMs: number | null = null;
  private postService: PostService;

  async setUp(postService: PostService) {
    this.timeCreationStartedInMs = transformDateToMs(new Date());

    for (let i = 0; i < posts.length; i++) {
      await postService.createPost(posts[i]);
    }

    this.timeCreationEndedInMs = transformDateToMs(new Date());

    this.postService = postService;
  }

  async cleanUp(postService: PostService) {
    await postService.clearDb();
  }

  getTimeCreationStartedInMs() {
    if (this.timeCreationStartedInMs == null) throw new Error();
    return this.timeCreationStartedInMs;
  }

  getTimeCreationEndedInMs() {
    if (this.timeCreationEndedInMs == null) throw new Error();
    return this.timeCreationEndedInMs;
  }

  async getAuctalPostsUsingValidPagination(pagination: Pagination) {
    return this.postService.getPosts(pagination);
  }

  getExpectedPostsUsingValidPagination(pagination: Pagination) {
    return _.map(posts.slice(pagination.offset), (post) => {
      const createdAt = expect.any(Date);
      const updatedAt = expect.any(Date);

      return { ...post, createdAt, updatedAt };
    });
  }

  getActualPostsLength() {
    return this.postService.getTotalPosts();
  }

  getExpectedPostsLength() {
    return posts.length;
  }

  getValidPaginations(): Pagination[] {
    return [
      { offset: 0, limit: posts.length },
      { offset: 2, limit: posts.length + 1 },
      { offset: 2, limit: posts.length + 100 },
    ];
  }

  getPostsCofigForEachTest() {
    return _.map(posts, (_, index) => ({ index }));
  }

  async getActualCreatedAt(index: number) {
    const posts = await this.postService.getPosts({ offset: index, limit: 1 });
    return transformDateToMs(posts[0]?.createdAt);
  }

  async getActualUpdatedAt(index: number) {
    const posts = await this.postService.getPosts({ offset: index, limit: 1 });
    return transformDateToMs(posts[0]?.updatedAt);
  }

  async getExceptedLowerBoundCreationTime(index: number) {
    if (index === 0) return this.timeCreationStartedInMs as number;
    return this.getActualCreatedAt(index - 1);
  }

  async getExceptedUpperBoundCreationTime(index: number) {
    if (index === this.getExpectedPostsLength() - 1) return this.timeCreationStartedInMs as number;
    return this.getActualCreatedAt(index + 1);
  }
}

export class WhenPostIsUpdatedTestBuilder {
  private postLength: number;
  private indexOfPostToUpdate = 3;
  private resultOfUpdatePost: Post;
  private postService: PostService;
  private expect: jest.Expect;
  private postToUpdate: Post;
  private updateStartedTimeInMs: number | null = null;
  private updateEndedTimeInMs: number | null = null;
  private update = {
    title: 'Edited Title',
    content: 'Edited content',
  };

  async setUp(postService: PostService, expect: jest.Expect) {
    this.postService = postService;
    this.expect = expect;

    for (let i = 0; i < posts.length; i++) {
      await postService.createPost(posts[i]);
    }

    this.postToUpdate = await this.fetchPostOfInterested();
    this.updateStartedTimeInMs = transformDateToMs(new Date());
    this.resultOfUpdatePost = await postService.updatePost({
      ...this.update,
      postId: this.postToUpdate.postId,
    });
    this.updateEndedTimeInMs = transformDateToMs(new Date());
  }

  getActualResultOfUpdatePost() {
    return this.resultOfUpdatePost;
  }

  getExpectedResultOfUpdatePost() {
    return {
      ...this.resultOfUpdatePost,
      ...this.update,
    };
  }

  async getActualPosts() {
    return this.postService.getPosts({ offset: 0, limit: posts.length });
  }

  async getExpectedPosts() {
    return _.map(posts, (post, index) => ({
      ...post,
      ...this.getUpdateForPostOfIndex(index),
      createdAt: this.expect.any(Date),
      lastUpdatedAt: this.expect.any(Date),
    }));
  }

  async getActualUpdatedAt() {
    return transformDateToMs(this.resultOfUpdatePost.updatedAt);
  }

  async getExceptedLowerBoundCreationTime() {
    return this.updateStartedTimeInMs as number;
  }

  async getExceptedUpperBoundCreationTime() {
    return this.updateEndedTimeInMs as number;
  }

  private getUpdateForPostOfIndex(index: number) {
    if (index === this.indexOfPostToUpdate) {
      return this.update;
    } else {
      return {};
    }
  }

  private async fetchPostOfInterested() {
    const fetchedPosts = await this.postService.getPosts({
      offset: this.indexOfPostToUpdate,
      limit: 1,
    });
    const fetchedPost = fetchedPosts[0];
    return fetchedPost;
  }
}

export class WhenPostIsDeletedTestBuilder {
  private postService: PostService;
  private expect: jest.Expect;
  private indexOfPostOfInterest = 2;
  private postOfInterest: Post;
  private deleteResult: boolean;

  async setUp(postService: PostService, expect: jest.Expect) {
    this.postService = postService;
    this.expect = expect;

    for (let i = 0; i < posts.length; i++) {
      await postService.createPost(posts[i]);
    }
    this.postOfInterest = await this.fetchPostOfInterested();
  }

  async deleteAPost() {
    this.deleteResult = await this.postService.deletePost(this.postOfInterest);
  }

  async deleteAlreadyDeletedPost() {
    this.deleteResult = await this.postService.deletePost(this.postOfInterest);
  }

  async deletePostThatDoesNotExist() {
    this.deleteResult = await this.postService.deletePost({ postId: '63ff5553cdc1798683083fb89' });
  }

  async getActualDeleteResult() {
    return this.deleteResult;
  }

  async getActualPosts() {
    return this.postService.getPosts({ offset: 0, limit: posts.length });
  }

  async getExpectedPostPropNotToBeContained() {
    return { postId: this.postOfInterest.postId };
  }
  private async fetchPostOfInterested() {
    const fetchedPosts = await this.postService.getPosts({
      offset: this.indexOfPostOfInterest,
      limit: 1,
    });
    const fetchedPost = fetchedPosts[0];
    return fetchedPost;
  }
}

const posts = [
  {
    userId: '63ff5553cdc1798683083fb5',
    title: 'Title of Post 1',
    content: 'Content of Post 1',
  },
  {
    userId: '63ff5553cdc1798683083fb6',
    title: 'Title of Post 2',
    content: 'Content of Post 2',
  },
  {
    userId: '63ff5553cdc1798683083fb7',
    title: 'Title of Post 3',
    content: 'Content of Post 3',
  },
  {
    userId: '63ff5553cdc1798683083fb8',
    title: 'Title of Post 4',
    content: 'Content of Post 4',
  },
];
