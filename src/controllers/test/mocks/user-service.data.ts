import mongoose from 'mongoose';
import * as _ from 'lodash';
import { User } from 'src/services/user/user.service';

export class UserServiceData {
  getUserById(userId: string) {
    const user: User | undefined = usersStore.userIdIndex[userId];
    return user;
  }

  getUserByEmail(email: string) {
    const user: User | undefined = usersStore.emailIndex[email];
    return user;
  }
}

const usersStore = {
  userIdIndex: {} as Record<string, User>,
  emailIndex: {} as Record<string, User>,
};

_.forEach(_.range(10), (index) => {
  const user = {
    userId: new mongoose.Types.ObjectId().toString(),
    email: `user${index + 1}@gmail.com`,
    createdAt: new Date(new Date().getTime() - index * 1000),
  };

  usersStore.userIdIndex[user.userId] = user;
  usersStore.emailIndex[user.email] = user;
});
