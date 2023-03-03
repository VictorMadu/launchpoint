import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  async createUser(user: UserToBeCreated): Promise<UserCreationResult> {
    return { getErrorReason: () => null, getUser: () => ({} as User) };
  }

  async findUser(query: FindUserQuery): Promise<UserQueryResult> {
    return { isUserFound: () => true, getUser: () => ({} as User) };
  }

  async clearDb(): Promise<void> {
    // throw new Error();
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

export const UserCreationErrorReason = {
  DUPLICATE_EMAIL: 'DUPLICATE_EMAIL',
} as const;

export type UserCreationErrorReasonType =
  (typeof UserCreationErrorReason)[keyof typeof UserCreationErrorReason];

export interface UserCreationResult<T extends boolean = boolean> {
  getErrorReason(): T extends true ? null : UserCreationErrorReasonType;
  getUser(): T extends true ? User : null;
}

export interface UserQueryResult<T extends boolean = boolean> {
  isUserFound(): T;
  getUser(): T extends true ? User : null;
}
