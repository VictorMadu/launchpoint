import * as _ from 'lodash';
import {
  FindUserQuery,
  User,
  UserCreationResult,
  UserQueryResult,
  UserService,
  UserToBeCreated,
} from 'src/services/user/user.service';
import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import { UserServiceData } from './user-service.data';
import { UserErrorReason } from 'src/services/user/user.error';
import { EventEmitter } from 'stream';

export class UserServiceMock {
  private userServiceData = UserServiceData.getInstance();

  async createUser(userToBeCreated: UserToBeCreated): Promise<UserCreationResult> {
    const user = this.userServiceData.getUserByEmail(userToBeCreated.email);

    if (user == null) {
      return { getErrorReason: () => UserErrorReason.DUPLICATE_EMAIL, getUser: () => null };
    } else {
      return { getErrorReason: () => null, getUser: () => user };
    }
  }

  async findUser(query: FindUserQuery): Promise<UserQueryResult> {
    const user = this.userServiceData.getUserById(query.userId);
    if (user == null) {
      return { isUserFound: () => false, getUser: () => null };
    } else {
      return { isUserFound: () => true, getUser: () => user };
    }
  }

  async clearDb(): Promise<void> {
    return;
  }
}
