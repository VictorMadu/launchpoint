import { Test, TestingModule } from '@nestjs/testing';
import { UserModule } from '../user.module';
import { UserCreationResult, UserService } from '../user.service';
import { WhenDataBaseIsClearedAfterUsersCreation } from './when-database-is-cleared-after-users-creation.test-builder';
import { WhenTwoUsersWithDuplicateEmailsAreCreatedSimultaneously } from './when-two-users-with-duplicate-emails-are-created-simultaneously.test-builder';
import { WhenUsersAreCreatedTestBuilder } from './when-users-are-created.test-builder';

describe('`UserService (Module)`', () => {
  let userService: UserService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UserModule],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  describe('When database is cleared after users creation', () => {
    const testBuilder1 = new WhenDataBaseIsClearedAfterUsersCreation();

    beforeAll(async () => {
      await userService.clearDb();
      await testBuilder1.setUp(userService, expect);
    });

    describe('`findUser`', () => {
      it.each(testBuilder1.getCreatedUsersParameters())(
        'should have created users not exit anymore',
        async (parameter) => {
          const actualQueryResult = await testBuilder1.getFindQueryResultUsingParameter(parameter);
          expect(actualQueryResult.isUserFound()).toBe(true);
          expect(actualQueryResult.getUser()).toEqual(null);
        },
      );
    });
  });

  describe('When users are created', () => {
    const testBuilder2 = new WhenUsersAreCreatedTestBuilder();

    beforeAll(async () => {
      await userService.clearDb();
      await testBuilder2.setUp(userService, expect);
    });

    describe('`createUser`', () => {
      it.each(testBuilder2.getCreatedUserParameters())(
        'should return correct output for created user of email $email',
        (parameter) => {
          const actual = testBuilder2.getActualCreatedUserResult(parameter);
          const expected = testBuilder2.getExpectedCreatedUserResult(parameter);

          expect(actual).toEqual(expected);
        },
      );

      it.each(testBuilder2.getCreatedUserParameters())(
        'should have created users fall within lower creation bound',
        (parameter) => {
          const actual = testBuilder2.getCreationTimeForCreatedUserWithParameter(parameter);
          const expected = testBuilder2.getLowerCreationBoundForCreatedUserWithParameter(parameter);

          expect(actual).toBeGreaterThanOrEqual(expected);
        },
      );

      it.each(testBuilder2.getCreatedUserParameters())(
        'should have created users fall within lower creation bound',
        (parameter) => {
          const actual = testBuilder2.getCreationTimeForCreatedUserWithParameter(parameter);
          const expected = testBuilder2.getUpperCreationBoundForCreatedUserWithParameter(parameter);

          expect(actual).toBeLessThanOrEqual(expected);
        },
      );
    });

    it('should give each users unique id', () => {
      const actual = testBuilder2.isUserIdsOfCreatedUsersUnique();
      const expected = true;

      expect(actual).toBe(expected);
    });

    describe('`findUser`', () => {
      it.each(testBuilder2.getCreatedUserParameters())(
        'should return correct output for created user of email $email',
        async (parameter) => {
          const userQueryResult =
            await testBuilder2.getActualFindUserResultUsingCreatedUserParameter(parameter);
          const expectedUser = testBuilder2.getActualCreatedUserResult(parameter);

          expect(userQueryResult.isUserFound()).toBe(true);
          expect(userQueryResult.getUser()).toEqual(expectedUser);
        },
      );

      it.each(testBuilder2.getUnCreatedUserParameters())(
        'should return correct output for uncreated user of userId $userId',
        async (parameter) => {
          const userQueryResult =
            await testBuilder2.getActualFindUserResultForUsingUnCreatedUserParameter(parameter);

          expect(userQueryResult.isUserFound()).toBe(false);
          expect(userQueryResult.getUser()).toEqual(null);
        },
      );
    });
  });

  describe('When multiple users with duplicate emails are created simultaneously', () => {
    const testBuilder3 = new WhenTwoUsersWithDuplicateEmailsAreCreatedSimultaneously();

    beforeAll(async () => {
      await userService.clearDb();
      testBuilder3.setUp(userService, expect);
    });

    it('should have the created user return expected result', () => {
      const userCreationResult = testBuilder3.getCreationResultForSuccessfulCreation();
      const user = testBuilder3.getExpectedUserDataForSuccessfulCreation();

      expect(userCreationResult.getErrorReason()).toBe(null);
      expect(userCreationResult.getUser()).toEqual(user);
    });

    it('should have the created user return expected result', () => {
      const isAllErrorReasonSame = testBuilder3.getIsAllErrorReasonSame();
      const isAllUserDataSame = testBuilder3.getIsAllUserDataSame();

      const errorReason = testBuilder3.getSharedErrorReasonOfFailedCreation();
      const userData = testBuilder3.getSharedUserDataOfFailedCreation();

      const expectedErrorReason = testBuilder3.getExpectedErrorReasonForAllFailedCreation();

      expect(isAllErrorReasonSame).toBe(true);
      expect(isAllUserDataSame).toBe(true);
      expect(userData).toBe(null);
      expect(errorReason).toBe(expectedErrorReason);
    });
  });
});
