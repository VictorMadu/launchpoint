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
  private result: UserCreationResult<boolean> | null = null;
  private arg: UserToBeCreated | null = null;

  constructor(private userService: UserServiceObservableMock) {
    this.userService.listen('createUser', this);
  }

  notify(event: { arg: UserToBeCreated; result: UserCreationResult<boolean> }): void {
    this.result = event.result;
    this.arg = event.arg;
    this.userService.remove('createUser', this);
  }

  getResult() {
    return this.result;
  }

  getArg() {
    return this.arg;
  }
}

export class ActualResultManager {
  private response: Request.Response;
  private createUserServerListener = new CreateUserServerListener(this.userService);

  constructor(private userService: UserServiceObservableMock, private requestBody: any) {}

  async makeRequest(request: typeof Request, server: Server, path: string) {
    this.response = await request(server).post(path).send(this.requestBody);
  }

  getStatusCode() {
    return this.response.statusCode;
  }

  getResponseBody() {
    return this.response.body;
  }

  getReturnedUserFromUserService() {
    const result = this.createUserServerListener.getResult();
    const user = result?.getUser();
    const errorReason = result?.getErrorReason();

    const wasNotCalled = user === undefined && errorReason === undefined;
    const hasAnyErrorReason = user == null || errorReason != null;

    if (wasNotCalled) return undefined;
    if (hasAnyErrorReason) return null;

    return {
      userId: user?.userId,
      email: user?.email,
      createdAt: user?.createdAt,
    };
  }
}

export class CreateUserTestBuilder {
  private idGenerator = new IdGenerator();
  private validParameterTestManager = new ValidParameterTestManager(this);
  private inValidParameterTestManager = new InValidParameterTestManager(this);
  private duplicateEmailParameterTestManager = new DuplicateEmailParameterTestManager(this);
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

  async sendRequest(requestBody: RequestBody, parameterManager: TestManager<Parameter>) {
    const actualResultManager = new ActualResultManager(this.userService, requestBody);
    await actualResultManager.makeRequest(this.request, this.server, this.path);

    parameterManager.setActualResultManager(actualResultManager);
    return actualResultManager;
  }

  getExpect() {
    return this.expect;
  }

  getIdGenerator() {
    return this.idGenerator;
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
  setActualResultManager(actualResultManager: ActualResultManager): void;
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
  private actualResultManager: ActualResultManager;
  private parameters: ValidParameter[] = _.map(_.range(2), (): ValidParameter => {
    const email = userServiceData.getUnExistingUser().email;
    const type = 'valid_request_body_data';
    const id = this.idGenerator.getNextId();
    const info = JSON.stringify(
      {
        id,
        type,
        email,
        description: 'We assume that the email thats not exist in the system already',
      },
      null,
      2,
    );

    return { email, type, id, info };
  });

  constructor(private createUserTestBuilder: CreateUserTestBuilder) {}

  setParamter(parameter: ValidParameter): void {
    this.paramter = parameter;
  }

  getRequestBody(): RequestBody {
    const email = this.paramter.email;
    return { email };
  }

  getExpectedStatusCode() {
    return 201;
  }

  getExpectedResponseBody() {
    const email = this.paramter.email;
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
    const user = this.actualResultManager.getReturnedUserFromUserService();
    return {
      userId: user?.userId,
      email: user?.email,
      createdAt: user?.createdAt,
    };
  }

  setActualResultManager(actualResultManager: ActualResultManager): void {
    this.actualResultManager = actualResultManager;
  }
}

class InValidParameterTestManager implements TestManager<InvalidParameter> {
  private idGenerator: IdGenerator = this.createUserTestBuilder.getIdGenerator();
  private expect: jest.Expect = this.createUserTestBuilder.getExpect();
  private paramter: InvalidParameter;
  private actualResultManager: ActualResultManager;
  private parameters: InvalidParameter[] = _.map(
    ['user1@gm', 'user2'],
    (inValidEmail): InvalidParameter => {
      const id = this.idGenerator.getNextId();
      const email = inValidEmail;
      const type = 'invalid_request_body_data';
      const errorType = 'INVALID_EMAIL';
      const info = JSON.stringify(
        {
          id,
          type,
          email,
          errorType,
          description:
            'We assume that the email thats not exist in the system already and is invalid',
        },
        null,
        2,
      );

      return { email, errorType, type, id, info };
    },
  );

  constructor(private createUserTestBuilder: CreateUserTestBuilder) {}

  setParamter(parameter: InvalidParameter): void {
    this.paramter = parameter;
  }

  getRequestBody(): RequestBody {
    const email = this.paramter.email;
    return { email };
  }

  getExpectedStatusCode() {
    return 400;
  }

  getExpectedResponseBody() {
    return {
      errors: [this.paramter.errorType],
    };
  }

  getParameters(): InvalidParameter[] {
    return this.parameters;
  }

  // Should be undefined because userService should not be called
  getExpectedReturnedUserFromUserService() {
    return undefined;
  }

  setActualResultManager(actualResultManager: ActualResultManager): void {
    this.actualResultManager = actualResultManager;
  }
}

class DuplicateEmailParameterTestManager implements TestManager<DuplicateEmailParameter> {
  private idGenerator: IdGenerator = this.createUserTestBuilder.getIdGenerator();
  private expect: jest.Expect = this.createUserTestBuilder.getExpect();
  private userServiceData = UserServiceData.getInstance();
  private actualResultManager: ActualResultManager;

  private paramter: DuplicateEmailParameter;
  private parameters: DuplicateEmailParameter[] = _.map(_.range(2), (): DuplicateEmailParameter => {
    const id = this.idGenerator.getNextId();
    const email = this.userServiceData.getNextExistingUser().email;
    const type = 'duplicate_email_request_body_data';
    const errorType = 'INVALID_EMAIL';
    const info = JSON.stringify(
      {
        id,
        type,
        email,
        errorType,
        description: 'We assume that the email exist in the system already and is invalid',
      },
      null,
      2,
    );

    return { email, errorType, type, id, info };
  });

  constructor(private createUserTestBuilder: CreateUserTestBuilder) {}

  setParamter(parameter: DuplicateEmailParameter): void {
    this.paramter = parameter;
  }

  getRequestBody(): RequestBody {
    const email = this.paramter.email;
    return { email };
  }

  getExpectedStatusCode() {
    return 400;
  }

  getExpectedResponseBody() {
    return {
      errors: [this.paramter.errorType],
    };
  }

  getParameters(): DuplicateEmailParameter[] {
    return this.parameters;
  }

  getExpectedReturnedUserFromUserService() {
    return null;
  }

  setActualResultManager(actualResultManager: ActualResultManager): void {
    this.actualResultManager = actualResultManager;
  }
}

// =============================================== Parameters =======================================

interface BaseParameter {
  id: number;
  type: string;
  info: string;
}

interface ValidParameter extends BaseParameter {
  type: 'valid_request_body_data';
  email: string;
}

interface InvalidParameter extends BaseParameter {
  type: 'invalid_request_body_data';
  email: string;
  errorType: string;
}

interface DuplicateEmailParameter extends BaseParameter {
  type: 'duplicate_email_request_body_data';
  email: string;
  errorType: string;
}

type Parameter = ValidParameter | InvalidParameter | DuplicateEmailParameter;
