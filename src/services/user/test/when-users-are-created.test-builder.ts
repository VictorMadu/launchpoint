import * as _ from 'lodash';
import mongoose from 'mongoose';
import { transformDateToMs } from 'src/services/common/date-to-ms';
import { User, UserService } from '../user.service';

export class WhenUsersAreCreatedTestBuilder {
  private userService: UserService;
  private expect: jest.Expect;
  private timeCreationStartedInMs: number;
  private timeCreationEndedInMs: number;
  private creationOfUserResultInDescendingOrder: User[] = new Array(createdUserParameters.length);

  async setUp(userService: UserService, expect: jest.Expect) {
    this.userService = userService;
    this.expect = expect;

    await this.createUsersAndSetCreationRange();
  }

  getCreatedUserParameters(): CreatedUserParameter[] {
    return createdUserParameters;
  }

  getUnCreatedUserParameters(): UnCreatedUserParameter[] {
    return unCreatedUserParameters;
  }

  getActualCreatedUserResult(parameter: CreatedUserParameter) {
    const position = this.getIndexForCreatedOfUserResultForDescendingOrdering(parameter.index);
    return this.creationOfUserResultInDescendingOrder[position];
  }

  getExpectedCreatedUserResult(parameter: CreatedUserParameter) {
    return {
      userId: this.expect.any(String),
      email: createdUserParameters[parameter.index].email,
      createdAt: this.expect.any(Date),
    };
  }

  getCreationTimeForCreatedUserWithParameter(parameter: CreatedUserParameter) {
    const position = this.getIndexForCreatedOfUserResultForDescendingOrdering(parameter.index);
    const user = this.creationOfUserResultInDescendingOrder[position];
    return transformDateToMs(user.createdAt);
  }

  getLowerCreationBoundForCreatedUserWithParameter(parameter: CreatedUserParameter) {
    if (parameter.index === 0) return this.timeCreationStartedInMs;

    const position = this.getIndexForCreatedOfUserResultForDescendingOrdering(parameter.index);
    const predecessorPosition = this.getPositionOfUserCreatedBeforeUserAtPosition(position);
    const predecessorUser = this.creationOfUserResultInDescendingOrder[predecessorPosition];

    return transformDateToMs(predecessorUser.createdAt);
  }

  getUpperCreationBoundForCreatedUserWithParameter(parameter: CreatedUserParameter) {
    if (parameter.index === createdUserParameters.length - 1) return this.timeCreationEndedInMs;

    const position = this.getIndexForCreatedOfUserResultForDescendingOrdering(parameter.index);
    const successorPosition = this.getPositionOfUserCreatedAfterUserAtPosition(position);
    const successorUser = this.creationOfUserResultInDescendingOrder[successorPosition];

    return transformDateToMs(successorUser.createdAt);
  }

  isUserIdsOfCreatedUsersUnique() {
    const allIds = _.map(this.creationOfUserResultInDescendingOrder, (user) => user.userId);
    const uniqueIds = new Set(allIds);

    return allIds.length === uniqueIds.size;
  }

  async getActualFindUserResultUsingCreatedUserParameter(parameter: CreatedUserParameter) {
    const position = this.getIndexForCreatedOfUserResultForDescendingOrdering(parameter.index);
    const userId = this.getPostIdOfUserAtPosition(position);

    return this.userService.findUser({ userId });
  }

  async getActualFindUserResultForUsingUnCreatedUserParameter(parameter: UnCreatedUserParameter) {
    const { userId } = parameter;
    return this.userService.findUser({ userId });
  }

  private getPositionOfUserCreatedBeforeUserAtPosition(position: number) {
    return Math.min(position + 1, this.creationOfUserResultInDescendingOrder.length - 1);
  }

  private getPositionOfUserCreatedAfterUserAtPosition(position: number) {
    return Math.max(position - 1, 0);
  }

  private getPostIdOfUserAtPosition(position: number) {
    return this.creationOfUserResultInDescendingOrder[position].userId;
  }

  private async createUsersAndSetCreationRange() {
    this.timeCreationStartedInMs = transformDateToMs(new Date());

    await this.createUsers();

    this.timeCreationEndedInMs = transformDateToMs(new Date());
  }

  private async createUsers() {
    for (let i = 0; i < createdUserParameters.length; i++) {
      const user = createdUserParameters[i];

      const creationResult = await this.userService.createUser(user);
      const createdUser = creationResult.getUser() as User;

      const position = this.getIndexForCreatedOfUserResultForDescendingOrdering(i);
      this.creationOfUserResultInDescendingOrder[position] = createdUser;
    }
  }

  private getIndexForCreatedOfUserResultForDescendingOrdering(creationIndex: number) {
    return createdUserParameters.length - creationIndex - 1;
  }
}

const createdUserParameters: CreatedUserParameter[] = _.map(
  [
    { email: 'user1@gmail.com' },
    { email: 'user2@gmail.com' },
    { email: 'user3@gmail.com' },
    { email: 'user4@gmail.com' },
    { email: 'user5@gmail.com' },
  ],
  (user, index): CreatedUserParameter => {
    return { email: user.email, index };
  },
);

const unCreatedUserParameters: UnCreatedUserParameter[] = _.map(_.range(4), (index) => {
  return {
    userId: new mongoose.Types.ObjectId().toString(),
    index,
  };
});

interface CreatedUserParameter {
  index: number;
  email: string;
}

interface UnCreatedUserParameter {
  index: number;
  userId: string;
}
