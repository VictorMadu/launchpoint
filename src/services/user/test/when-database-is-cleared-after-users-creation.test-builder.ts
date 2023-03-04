import * as _ from 'lodash';
import { User, UserService } from '../user.service';

export class WhenDataBaseIsClearedAfterUsersCreation {
  private userService: UserService;
  private expect: jest.Expect;
  private createdUsersInAscendingOrderOfCreation: User[] = new Array(createdUserParameters.length);

  async setUp(userService: UserService, expect: jest.Expect) {
    this.userService = userService;
    this.expect = expect;

    await this.createUsers();
    await this.clearDb();
  }

  getCreatedUsersParameters() {
    return createdUserParameters;
  }

  async getFindQueryResultUsingParameter(parameter: CreatedUserParameter) {
    const user = this.createdUsersInAscendingOrderOfCreation[parameter.index];
    return this.userService.findUser({ userId: user.userId });
  }

  private async createUsers() {
    await Promise.all(
      _.map(createdUserParameters, async (parameter, index) => {
        const creationResult = await this.userService.createUser({ email: parameter.email });
        const user = creationResult.getUser() as User;
        this.createdUsersInAscendingOrderOfCreation[index] = user;
      }),
    );
  }

  private async clearDb() {
    await this.userService.clearDb();
  }
}

interface CreatedUserParameter {
  index: number;
  email: string;
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
