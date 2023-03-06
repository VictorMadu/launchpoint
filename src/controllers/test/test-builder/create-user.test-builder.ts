import * as Request from 'supertest';
import mongoose from 'mongoose';
import * as _ from 'lodash';
import {
  FindUserQuery,
  User,
  UserCreationResult,
  UserQueryResult,
  UserToBeCreated,
} from 'src/services/user/user.service';
import { Server } from 'http';
import { UserServiceData } from '../mocks/user-service.data';
import { Listener, UserServiceObservableMock } from '../mocks/user-service-observable.mock';
import { IdGenerator } from '../mocks/id-generator';

class CreateUserServerListener implements Listener<'createUser'> {
  constructor(private createUserTestBuilder: CreateUserTestBuilder) {}

  notify(event: { arg: UserToBeCreated; result: UserCreationResult<boolean> }): void {
    this.createUserTestBuilder.setCreateUserServiceResult(event.result);
  }
}

export class CreateUserTestBuilder {
  private idGenerator = new IdGenerator();
  private validParameterTestManager = new ValidParameterTestManager(this);
  private inValidParameterTestManager = new InValidParameterTestManager(this);
  private duplicateEmailParameterTestManager = new DuplicateEmailParameterTestManager(this);
  private createUserServiceResult: UserCreationResult<boolean> | null = null;
  private listener = new CreateUserServerListener(this);
  private response: Request.Response;
  private userService: UserServiceObservableMock;
  private server: Server;

  constructor(private expect: jest.Expect, private request: typeof Request, private path: string) {}

  setUserService(userService: UserServiceObservableMock) {
    this.userService = userService;
  }

  setServer(server: Server) {
    this.server = server;
  }

  getParameters(): Parameter[] {
    return [
      ...this.validParameterTestManager.getParameters(),
      ...this.inValidParameterTestManager.getParameters(),
      ...this.duplicateEmailParameterTestManager.getParameters(),
    ];
  }

  getParameterManager(parameter: Parameter) {
    return this.getTestManagerForParamterAndSet(parameter);
  }

  async sendRequest(requestBody: RequestBody) {
    this.userService.listen('createUser', this.listener);
    this.response = await this.request(this.server).post(this.path).send(requestBody);
  }

  getStatusCode() {
    return this.response.statusCode;
  }

  getResponseBody() {
    return this.response.body;
  }

  getExpect() {
    return this.expect;
  }

  getIdGenerator() {
    return this.idGenerator;
  }

  setCreateUserServiceResult(createUserServiceResult: UserCreationResult<boolean>) {
    this.createUserServiceResult = createUserServiceResult;
  }

  getUserFromUserService() {
    return this.createUserServiceResult?.getUser();
  }

  getReturnedUserFromUserService() {
    const user = this.getUserFromUserService();

    if (user != null) {
      return {
        userId: user?.userId,
        email: user?.email,
        createdAt: user?.createdAt,
      };
    } else {
      return user;
    }
  }

  private getTestManagerForParamterAndSet(parameter: Parameter): TestManager<Parameter> {
    const testManager = this.getTestManagerForParamter(parameter);
    testManager.setParamter(parameter);

    return testManager;
  }

  private getTestManagerForParamter(parameter: Parameter): TestManager<Parameter> {
    switch (parameter.type) {
      case 'valid_request_body_data':
        return this.validParameterTestManager;

      case 'invalid_request_body_data':
        return this.inValidParameterTestManager;

      case 'duplicate_email_request_body_data':
        return this.duplicateEmailParameterTestManager;

      default:
        throw new Error();
    }
  }
}

// ============================================== Test Managers =================================

export type ParameterManager<T extends Parameter = Parameter> = TestManager<T>;

interface TestManager<T extends Parameter> {
  setParamter(paramter: T): void;
  getRequestBody(): RequestBody;
  getExpectedStatusCode(): number;
  getExpectedResponseBody(): any;
  getParameters(): T[];
  getExpectedReturnedUserFromUserService(): any;
}

interface RequestBody {
  email: string;
}

const userServiceData = UserServiceData.getInstance();

class ValidParameterTestManager implements TestManager<ValidParameter> {
  private idGenerator: IdGenerator = this.createUserTestBuilder.getIdGenerator();
  private expect: jest.Expect = this.createUserTestBuilder.getExpect();
  private paramter: ValidParameter;
  private parameters: ValidParameter[] = [
    {
      ctx: { email: userServiceData.getUnExistingUser().email },
      type: 'valid_request_body_data',
      id: this.idGenerator.getNextId(),
    },
    {
      ctx: { email: userServiceData.getUnExistingUser().email },
      type: 'valid_request_body_data',
      id: this.idGenerator.getNextId(),
    },
  ];

  constructor(private createUserTestBuilder: CreateUserTestBuilder) {}

  setParamter(parameter: ValidParameter): void {
    this.paramter = parameter;
  }

  getRequestBody(): RequestBody {
    console.log('ValidParameterTestManager', this.paramter);
    const email = this.paramter.ctx.email;
    return { email };
  }

  getExpectedStatusCode() {
    return 201;
  }

  getExpectedResponseBody() {
    const email = this.paramter.ctx.email;
    return {
      userId: this.expect.any(String),
      email,
      createdAt: this.expect.any(String),
    };
  }

  getParameters(): ValidParameter[] {
    return this.parameters;
  }

  getExpectedReturnedUserFromUserService() {
    const user = this.createUserTestBuilder.getUserFromUserService();
    return {
      userId: user?.userId,
      email: user?.email,
      createdAt: user?.createdAt,
    };
  }
}

class InValidParameterTestManager implements TestManager<InvalidParameter> {
  private idGenerator: IdGenerator = this.createUserTestBuilder.getIdGenerator();
  private expect: jest.Expect = this.createUserTestBuilder.getExpect();
  private paramter: InvalidParameter;
  private parameters: InvalidParameter[] = [
    {
      ctx: { email: 'user1@gm', errorType: 'INVALID_EMAIL' },
      type: 'invalid_request_body_data',
      id: this.idGenerator.getNextId(),
    },
    {
      ctx: { email: 'user2', errorType: 'INVALID_EMAIL' },
      type: 'invalid_request_body_data',
      id: this.idGenerator.getNextId(),
    },
  ];

  constructor(private createUserTestBuilder: CreateUserTestBuilder) {}

  setParamter(parameter: InvalidParameter): void {
    this.paramter = parameter;
  }

  getRequestBody(): RequestBody {
    const email = this.paramter.ctx.email;
    return { email };
  }

  getExpectedStatusCode() {
    return 401;
  }

  getExpectedResponseBody() {
    return {
      error: this.paramter.ctx.errorType,
    };
  }

  getParameters(): InvalidParameter[] {
    return this.parameters;
  }

  // Should be undefined because userService should not be called
  getExpectedReturnedUserFromUserService() {
    return undefined;
  }
}

class DuplicateEmailParameterTestManager implements TestManager<DuplicateEmailParameter> {
  private idGenerator: IdGenerator = this.createUserTestBuilder.getIdGenerator();
  private expect: jest.Expect = this.createUserTestBuilder.getExpect();
  private userServiceData = UserServiceData.getInstance();

  private paramter: DuplicateEmailParameter;
  private parameters: DuplicateEmailParameter[] = [
    {
      ctx: { email: this.userServiceData.getNextExistingUser().email, errorType: 'INVALID_EMAIL' },
      type: 'duplicate_email_request_body_data',
      id: this.idGenerator.getNextId(),
    },
    {
      ctx: { email: this.userServiceData.getNextExistingUser().email, errorType: 'INVALID_EMAIL' },
      type: 'duplicate_email_request_body_data',
      id: this.idGenerator.getNextId(),
    },
  ];

  constructor(private createUserTestBuilder: CreateUserTestBuilder) {}

  setParamter(parameter: DuplicateEmailParameter): void {
    this.paramter = parameter;
  }

  getRequestBody(): RequestBody {
    const email = this.paramter.ctx.email;
    return { email };
  }

  getExpectedStatusCode() {
    return 401;
  }

  getExpectedResponseBody() {
    return {
      error: this.paramter.ctx.errorType,
    };
  }

  getParameters(): DuplicateEmailParameter[] {
    return this.parameters;
  }

  getExpectedReturnedUserFromUserService() {
    return null;
  }
}

// =============================================== Parameters =======================================

interface BaseParameter {
  id: number;
  type: string;
  ctx: any;
}

interface ValidParameter extends BaseParameter {
  type: 'valid_request_body_data';
  ctx: {
    email: string;
  };
}

interface InvalidParameter extends BaseParameter {
  type: 'invalid_request_body_data';
  ctx: {
    email: string;
    errorType: string;
  };
}

interface DuplicateEmailParameter extends BaseParameter {
  type: 'duplicate_email_request_body_data';
  ctx: {
    email: string;
    errorType: string;
  };
}

type Parameter = ValidParameter | InvalidParameter | DuplicateEmailParameter;
