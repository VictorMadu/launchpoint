import * as _ from 'lodash';
import PostService from '../post.service';
import {
  WhenDatabaseIsClearedAfterCreatedTestBuilder,
  WhenSequenceOfPostAreCreatedTestBuilder,
  WhenPostIsCreatedTestBuilder,
  WhenStartingFromOriginTestBuilder,
  WhenPostIsUpdatedTestBuilder,
  WhenPostIsDeletedTestBuilder,
} from './post.test-builder';

describe('`Post`', () => {
  let postService: PostService;

  beforeAll(() => {
    postService = new PostService();
  });

  describe('When service is starting from origin (no action yet)', () => {
    const testBuilder1 = new WhenStartingFromOriginTestBuilder();

    beforeAll(async () => {
      await testBuilder1.setUp(postService);
    });

    describe('`getPosts`', () => {
      it('should return empty array', () => {
        const actual = testBuilder1.getActualPosts();
        const expected = testBuilder1.getExpectedPosts();
        expect(actual).toEqual(expected);
      });
    });

    describe('`getTotalPosts`', () => {
      it('should return 0', () => {
        const actual = testBuilder1.getActualTotalPosts();
        const expected = testBuilder1.getExpectedTotalPosts();
        expect(actual).toBe(expected);
      });
    });
  });

  describe('When a post is to be created', () => {
    const testBuilder2 = new WhenPostIsCreatedTestBuilder(expect);

    beforeAll(async () => {
      await testBuilder2.setUp(postService);
    });

    describe('`createPost`', () => {
      it('should return created post', () => {
        const actual = testBuilder2.getActualPost();
        const expected = testBuilder2.getExpectedPost();
        expect(actual).toEqual(expected);
      });
    });

    describe('`getPostsLength`', () => {
      it('should return 1', () => {
        const actual = testBuilder2.getActualTotalPosts();
        const expected = testBuilder2.getExpectedTotalPosts();
        expect(actual).toBe(expected);
      });
    });
  });

  describe('When database is cleared after being created', () => {
    const testBuilder3 = new WhenDatabaseIsClearedAfterCreatedTestBuilder();

    it('should have number of documents in database to be 0', () => {
      const actual = testBuilder3.getActualTotalPosts();
      const expected = testBuilder3.getExpectedTotalPosts();
      expect(actual).toBe(expected);
    });
  });

  describe('When sequence of posts have been created', () => {
    const testBuilder4 = new WhenSequenceOfPostAreCreatedTestBuilder();

    beforeAll(async () => {
      await testBuilder4.setUp(postService);
    });

    afterAll(async () => {
      await testBuilder4.cleanUp(postService);
    });

    describe('`getPosts`', () => {
      // NOTE: We are expecting only valid pagination to be passed, if this method is called in a controller, it will be handled there

      it.each(testBuilder4.getValidPaginations())(
        'should return correct array with post returned in the descending order of their creation of pagination (offset: $offset, limit: $limit)',
        async (pagination) => {
          const result = await testBuilder4.getAuctalPostsUsingValidPagination(pagination);
          const expected = testBuilder4.getExpectedPostsUsingValidPagination(pagination);
          expect(result).toEqual(expected);
        },
      );

      it.each(testBuilder4.getPostsCofigForEachTest())(
        'should return array of post with created and updated in expected lower bound range for post of index $index',
        async ({ index }) => {
          const result1 = await testBuilder4.getActualCreatedAt(index);
          const result2 = await testBuilder4.getActualUpdatedAt(index);
          const expected = await testBuilder4.getExceptedLowerBoundCreationTime(index);

          expect(result1).toBeGreaterThanOrEqual(expected);
          expect(result2).toBeGreaterThanOrEqual(expected);
        },
      );

      it.each(testBuilder4.getPostsCofigForEachTest())(
        'should return array of post with created and updated in expected upper bound range for post of index $index',
        async ({ index }) => {
          const result1 = await testBuilder4.getActualCreatedAt(index);
          const result2 = await testBuilder4.getActualUpdatedAt(index);
          const expected = await testBuilder4.getExceptedUpperBoundCreationTime(index);

          expect(result1).toBeLessThanOrEqual(expected);
          expect(result2).toBeLessThanOrEqual(expected);
        },
      );
    });

    describe('`getTotalPosts`', () => {
      it('should return correct total posts', async () => {
        const actual = testBuilder4.getActualPostsLength();
        const expected = testBuilder4.getExpectedPostsLength();

        expect(actual).toBe(expected);
      });
    });
  });

  describe('When a post is updated', () => {
    const testBuilder5 = new WhenPostIsUpdatedTestBuilder();

    beforeAll(async () => {
      await testBuilder5.setUp(postService, expect);
    });

    describe('`updatePost`', () => {
      it('should return updated post', () => {
        const actual = testBuilder5.getActualResultOfUpdatePost();
        const expected = testBuilder5.getExpectedResultOfUpdatePost();

        expect(actual).toBe(expected);
      });
    });

    describe('`getPosts`', () => {
      it('should return posts with updated items', async () => {
        const actual = await testBuilder5.getActualPosts();
        const expected = await testBuilder5.getExpectedPosts();

        expect(actual).toBe(expected);
      });
    });

    it("should have post's updatedAt to be in the lower bound range", async () => {
      const actual = await testBuilder5.getActualUpdatedAt();
      const lowerBound = await testBuilder5.getExceptedLowerBoundCreationTime();

      expect(actual).toBeGreaterThanOrEqual(lowerBound);
    });

    it("should have post's updatedAt to be in the lower bound range", async () => {
      const actual = await testBuilder5.getActualUpdatedAt();
      const upperBound = await testBuilder5.getExceptedUpperBoundCreationTime();

      expect(actual).toBeLessThanOrEqual(upperBound);
    });
  });

  describe('When a post is deleted', () => {
    const testBuilder6 = new WhenPostIsDeletedTestBuilder();

    beforeAll(async () => {
      await testBuilder6.setUp(postService, expect);
    });

    describe('`deletePost`', () => {
      it('should return true if post was deleted', async () => {
        await testBuilder6.deleteAPost();
        const actual = await testBuilder6.getActualDeleteResult();
        const expected = true;

        expect(actual).toBe(expected);
      });

      it('should return false if post was already deleted', async () => {
        await testBuilder6.deleteAlreadyDeletedPost();
        const actual = await testBuilder6.getActualDeleteResult();
        const expected = false;

        expect(actual).toBe(expected);
      });

      it('should return false if post does not exist', async () => {
        await testBuilder6.deletePostThatDoesNotExist();
        const actual = await testBuilder6.getActualDeleteResult();
        const expected = false;

        expect(actual).toBe(expected);
      });
    });

    describe('`getPosts`', () => {
      it('should return all posts without deleted item', async () => {
        const actual = await testBuilder6.getActualPosts();
        const expected = await testBuilder6.getExpectedPostPropNotToBeContained();

        expect(actual).toEqual(expect.not.arrayContaining([expect.objectContaining(expected)]));
      });
    });
  });
});
