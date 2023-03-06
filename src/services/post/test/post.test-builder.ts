import * as _ from 'lodash';
import { PostService, Post, PostQueryResult } from '../post.service';
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
      postId: this.expect.any(String),
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
  private postsInDescendingOrderOfCreation: Post[] = new Array(posts.length);

  async setUp(postService: PostService) {
    this.postService = postService;

    this.timeCreationStartedInMs = transformDateToMs(new Date());

    for (let i = 0; i < posts.length; i++) {
      const post = await postService.createPost(posts[i]);
      const position = posts.length - i - 1;

      this.postsInDescendingOrderOfCreation[position] = post;
    }

    this.timeCreationEndedInMs = transformDateToMs(new Date());
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
    return this.postsInDescendingOrderOfCreation.slice(pagination.offset);
  }

  async getActualPostsLength() {
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
    return transformDateToMs(posts[0]?.lastUpdatedAt);
  }

  async getExceptedLowerBoundCreationTime(index: number) {
    if (index === this.getExpectedPostsLength() - 1) return this.timeCreationStartedInMs as number;
    return this.getActualCreatedAt(index + 1);
  }

  async getExceptedUpperBoundCreationTime(index: number) {
    if (index === 0) return this.timeCreationEndedInMs as number;
    return this.getActualCreatedAt(index - 1);
  }

  getExistingPostIdParameters(): PostIdParamter[] {
    return _.map(_.range(posts.length), (index): PostIdParamter => {
      return { id: index, type: 'existing' };
    });
  }

  getUnExistingPostIdParameters(): PostIdParamter[] {
    return _.map(_.range(idOfUnExistingPosts.length), (index): PostIdParamter => {
      return { id: index, type: 'unexisting' };
    });
  }

  async getActualResultOfGetPostByIdForParameter(paramter: PostIdParamter) {
    const postId = this.getPostIdOfPostIdParameter(paramter);
    return await this.postService.getPostById(postId);
  }

  getExpectedResultOfGetExistingPostByIdForParameter(paramter: PostIdParamter): PostQueryResult {
    const id = paramter.id;
    return {
      isFound: () => true,
      getData: () => this.postsInDescendingOrderOfCreation[id],
    };
  }

  getExpectedResultOfGetUnExistingPostByIdForParameter(paramter: PostIdParamter): PostQueryResult {
    return {
      isFound: () => false,
      getData: () => null,
    };
  }

  private getPostIdOfPostIdParameter(parameter: PostIdParamter) {
    const { id, type } = parameter;
    let postId: string;

    if (type === 'existing') {
      postId = this.postsInDescendingOrderOfCreation[id].postId;
    } else {
      postId = idOfUnExistingPosts[id];
    }

    return postId;
  }
}

interface PostIdParamter {
  id: number;
  type: 'existing' | 'unexisting';
}

export class WhenPostIsUpdatedTestBuilder {
  private postLength: number;
  private indexOfPostToUpdate = 3;
  private resultOfUpdatePost: Post;
  private postService: PostService;
  private expect: jest.Expect;
  private updateStartedTimeInMs: number | null = null;
  private updateEndedTimeInMs: number | null = null;
  private postsInDescendingOrderOfCreation: Post[] = new Array(posts.length);
  private update = {
    title: 'Edited Title',
    content: 'Edited content',
  };

  async setUp(postService: PostService, expect: jest.Expect) {
    this.postService = postService;
    this.expect = expect;

    for (let i = 0; i < posts.length; i++) {
      const post = await postService.createPost(posts[i]);
      const position = posts.length - i - 1;

      this.postsInDescendingOrderOfCreation[position] = post;
    }

    await this.updatePostOfInterestAndNoteUpdateTimeRange();
    await this.updateCreatedPostToReflectUpdate();
  }

  getActualResultOfUpdatePost() {
    return this.resultOfUpdatePost;
  }

  getExpectedResultOfUpdatePost() {
    const post = this.fetchPostOfInterested();
    return this.setLastUpdateWithAnyDateAtPropFor(post);
  }

  async getActualPosts() {
    return this.postService.getPosts({ offset: 0, limit: posts.length });
  }

  async getExpectedPosts() {
    return _.map(this.postsInDescendingOrderOfCreation, (post) => {
      return this.setLastUpdateWithAnyDateAtPropFor(post);
    });
  }

  async getActualUpdatedAt() {
    return transformDateToMs(this.resultOfUpdatePost.lastUpdatedAt);
  }

  async getExceptedLowerBoundCreationTime() {
    return this.updateStartedTimeInMs as number;
  }

  async getExceptedUpperBoundCreationTime() {
    return this.updateEndedTimeInMs as number;
  }

  private setLastUpdateWithAnyDateAtPropFor(post: Post) {
    const otherProps = _.omit(post, 'lastUpdatedAt');
    return { lastUpdatedAt: this.expect.any(Date), ...otherProps };
  }

  private fetchPostOfInterested() {
    return this.postsInDescendingOrderOfCreation[this.indexOfPostToUpdate];
  }

  private async updatePostOfInterestAndNoteUpdateTimeRange() {
    this.updateStartedTimeInMs = transformDateToMs(new Date());
    await this.updatePostOfInterest();
    this.updateEndedTimeInMs = transformDateToMs(new Date());
  }

  private async updatePostOfInterest() {
    const postToUpdate = this.fetchPostOfInterested();

    this.resultOfUpdatePost = await this.postService.updatePost({
      postId: postToUpdate.postId,
      updates: { ...this.update },
    });
  }

  private async updateCreatedPostToReflectUpdate() {
    const postToUpdate = this.fetchPostOfInterested();
    const updateProps = Object.keys(this.update);

    for (let i = 0; i < updateProps.length; i++) {
      const updateProp = updateProps[i] as keyof typeof this.update;
      postToUpdate[updateProp] = this.update[updateProp];
    }
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
    const postThatDoesNotExistId = '63ff5553cdc1798683083fa1';
    this.deleteResult = await this.postService.deletePost({ postId: postThatDoesNotExistId });
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
    creatorUserId: '63ff5553cdc1798683083fb5',
    title: 'Title of Post 1',
    content: 'Content of Post 1',
  },
  {
    creatorUserId: '63ff5553cdc1798683083fb6',
    title: 'Title of Post 2',
    content: 'Content of Post 2',
  },
  {
    creatorUserId: '63ff5553cdc1798683083fb7',
    title: 'Title of Post 3',
    content: 'Content of Post 3',
  },
  {
    creatorUserId: '63ff5553cdc1798683083fb8',
    title: 'Title of Post 4',
    content: 'Content of Post 4',
  },
];

const idOfUnExistingPosts = ['63ff5553cdc1798683083fa0', '63ff5553cdc1798683083fa1'];
