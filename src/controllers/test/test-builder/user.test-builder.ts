import mongoose from 'mongoose';
import * as _ from 'lodash';
import { User } from 'src/services/user/user.service';

export class UserTestBuilder {
  getAllUsersInDescendingOrderOfCreation() {
    return allUsersInDescendingOrderOfCreation;
  }
}

const usersStore = {
  userIdIndex: 
} 

as Record<string, User>;
const emailIndex = {} as Record<string, string>;

_.forEach(_.range(10), (index) => {
  const user = {
    userId: new mongoose.Types.ObjectId().toString(),
    email: `user${index + 1}@gmail.com`,
    createdAt: new Date(new Date().getTime() - index * 1000),
  };

  allUsersInDescendingOrderOfCreation[user.userId] = user;
  emailIndex[user.email] = user.u
});
