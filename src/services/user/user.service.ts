import { Injectable } from '@nestjs/common';
import { UserErrorReason } from './user.error';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async createUser(user: UserToBeCreated): Promise<UserCreationResult> {
    const result = await this.userRepository.insertOne(user);
    return { getErrorReason: () => result.errorReason, getUser: () => result.user };
  }

  async findUser(query: FindUserQuery): Promise<UserQueryResult> {
    const result = await this.userRepository.findOneById(query.userId);
    return { isUserFound: () => result.isUserFound, getUser: () => result.user };
  }

  async clearDb(): Promise<void> {
    await this.userRepository.clearDb();
  }
}

export interface UserToBeCreated {
  email: string;
}

export interface FindUserQuery {
  userId: string;
}

export interface User {
  userId: string;
  email: string;
  createdAt: Date;
}

export interface UserCreationResult<T extends boolean = boolean> {
  getErrorReason(): T extends true ? null : UserErrorReason;
  getUser(): T extends true ? User : null;
}

export interface UserQueryResult<T extends boolean = boolean> {
  isUserFound(): T;
  getUser(): T extends true ? User : null;
}
