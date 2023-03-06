import mongoose from 'mongoose';
import * as _ from 'lodash';
import { User } from 'src/services/user/user.service';

const totalExistingUsers = 10;

export class UserServiceData {
  private static instance: UserServiceData | null = null;

  private currentUserIndex = 0;
  private currentUnExistingUserIndex = totalExistingUsers;

  static getInstance(): UserServiceData {
    if (UserServiceData.instance == null) {
      UserServiceData.instance = new UserServiceData();
    }

    return UserServiceData.instance;
  }

  getUserById(userId: string) {
    const user: User | undefined = usersStore.userIdIndex[userId];
    return user;
  }

  getUserByEmail(email: string) {
    const user: User | undefined = usersStore.emailIndex[email];
    return user;
  }

  getNextExistingUser() {
    return usersStore.users[this.currentUserIndex++];
  }

  getUnExistingUser() {
    return {
      userId: undefined,
      email: `user${this.currentUnExistingUserIndex++}@gmail.com`,
      createdAt: undefined,
    };
  }

  private constructor() {
    return;
  }
}

const usersStore = {
  userIdIndex: {} as Record<string, User>,
  emailIndex: {} as Record<string, User>,
  users: new Array(totalExistingUsers) as User[],
};

_.forEach(_.range(totalExistingUsers), (index) => {
  const user = {
    userId: new mongoose.Types.ObjectId().toString(),
    email: `user${index + 1}@gmail.com`,
    createdAt: new Date(new Date().getTime() - index * 1000),
  };

  usersStore.userIdIndex[user.userId] = user;
  usersStore.emailIndex[user.email] = user;
  usersStore.users[index] = user;
});
