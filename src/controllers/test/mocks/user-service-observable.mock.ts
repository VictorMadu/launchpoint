import * as _ from 'lodash';
import {
  UserToBeCreated,
  UserCreationResult,
  FindUserQuery,
  UserQueryResult,
} from 'src/services/user/user.service';
import { UserServiceMock } from './user-service.mock';

export class UserServiceObservableMock {
  private listeners = new Map<FunctionCallEvents, Listener<FunctionCallEvents>[]>();

  constructor(private userServiceMock: UserServiceMock) {}

  async createUser(arg: UserToBeCreated): Promise<UserCreationResult> {
    const result = await this.userServiceMock.createUser(arg);
    this.notifyListeners('createUser', { arg, result });

    return result;
  }

  async findUser(arg: FindUserQuery): Promise<UserQueryResult> {
    const result = await this.userServiceMock.findUser(arg);
    this.notifyListeners('findUser', { arg, result });

    return result;
  }

  async clearDb(): Promise<void> {
    return this.userServiceMock.clearDb();
  }

  async listen<Event extends FunctionCallEvents>(event: Event, listener: Listener<Event>) {
    const listeners = this.listeners.get(event) ?? [];
    this.listeners.set(event, [...listeners, listener]);
  }

  async remove<Event extends FunctionCallEvents>(event: Event, listener: Listener<Event>) {
    const listeners = this.listeners.get(event) ?? [];
    const filteredListeners = listeners.filter((currListener) => currListener !== listener);

    if (listeners.length < 1) {
      this.listeners.delete(event);
    } else {
      this.listeners.set(event, filteredListeners);
    }
  }

  private notifyListeners<Event extends FunctionCallEvents>(event: Event, payload: Payload<Event>) {
    const listeners = this.listeners.get(event) ?? [];
    _.forEach(listeners, (listener: Listener<Event>) => listener.notify(payload));
  }
}

export interface Listener<Event extends FunctionCallEvents> {
  notify(
    event: Event extends 'createUser'
      ? { arg: UserToBeCreated; result: UserCreationResult }
      : { arg: FindUserQuery; result: UserQueryResult },
  ): void;
}

type Payload<Event extends FunctionCallEvents> = Event extends 'createUser'
  ? { arg: UserToBeCreated; result: UserCreationResult }
  : { arg: FindUserQuery; result: UserQueryResult };

export type FunctionCallEvents = 'createUser' | 'findUser';
