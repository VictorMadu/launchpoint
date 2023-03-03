import * as _ from 'lodash';
import {
  User,
  UserCreationErrorReason,
  UserCreationErrorReasonType,
  UserCreationResult,
  UserService,
} from '../user.service';

const userEmail = 'user1@gmail.com';

export class WhenTwoUsersWithDuplicateEmailsAreCreatedSimultaneously {
  private userService: UserService;
  private expect: jest.Expect;
  private creationResults: UserCreationResult[] = new Array(users.length);
  private creationStatus: CreationStatus = { succeeded: -1, failed: [] };

  async setUp(userService: UserService, expect: jest.Expect) {
    this.userService = userService;
    this.expect = expect;

    await this.createTwoUsersConcurrently();
    await this.setIndexOfCreationsInStatus();
  }

  getCreationResultForSuccessfulCreation() {
    return this.creationResults[this.creationStatus.succeeded];
  }

  getExpectedUserDataForSuccessfulCreation() {
    return {
      userId: this.expect.any(String),
      email: userEmail,
      createdAt: this.expect.any(Date),
    };
  }

  getIsAllErrorReasonSame() {
    let sharedErrorReason: UserCreationErrorReasonType | null = null;
    let hasBeenAssignedAValue = false;

    for (let i = 0; i < this.creationStatus.failed.length; i++) {
      const creationIndex = this.creationStatus.failed[i];
      const creationResult = this.creationResults[creationIndex];

      const errorReason = creationResult.getErrorReason();

      if (hasBeenAssignedAValue) {
        const isNotSame = sharedErrorReason !== errorReason;
        if (isNotSame) return false;
      } else {
        sharedErrorReason = errorReason;
        hasBeenAssignedAValue = true;
      }
    }
    return true;
  }

  getIsAllUserDataSame() {
    let sharedUser: User | null = null;
    let hasBeenAssignedAValue = false;

    for (let i = 0; i < this.creationStatus.failed.length; i++) {
      const creationIndex = this.creationStatus.failed[i];
      const creationResult = this.creationResults[creationIndex];

      const user = creationResult.getUser();

      if (hasBeenAssignedAValue) {
        const isNotSame = sharedUser !== user;
        if (isNotSame) return false;
      } else {
        sharedUser = user;
        hasBeenAssignedAValue = true;
      }
    }
    return true;
  }

  getSharedErrorReasonOfFailedCreation() {
    const anyFailedIndexArrayIndex = 0;
    const aFailedIndex = this.creationStatus.failed[anyFailedIndexArrayIndex];

    return this.creationResults[aFailedIndex].getErrorReason();
  }

  getSharedUserDataOfFailedCreation() {
    const anyFailedIndexArrayIndex = 0;
    const aFailedIndex = this.creationStatus.failed[anyFailedIndexArrayIndex];

    return this.creationResults[aFailedIndex].getUser();
  }

  getExpectedErrorReasonForAllFailedCreation() {
    return UserCreationErrorReason.DUPLICATE_EMAIL;
  }

  private async createTwoUsersConcurrently() {
    await Promise.all(
      _.map(users, async (user, index) => {
        const result = await this.userService.createUser(user);
        this.creationResults[index] = result;
      }),
    );
  }

  private async setIndexOfCreationsInStatus() {
    _.forEach(this.creationResults, (creationResult, index) => {
      if (creationResult.getUser() == null) {
        this.creationStatus.failed.push(index);
      } else {
        this.creationStatus.succeeded = index;
      }
    });
  }
}

const users: CreatedUserParameter[] = _.map(_.range(20), (index) => {
  return { index, email: userEmail };
});

interface CreatedUserParameter {
  index: number;
  email: string;
}

interface CreationStatus {
  succeeded: number;
  failed: number[];
}
