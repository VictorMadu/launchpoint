import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { PostService } from 'src/services/post/post.service';
import { UserService } from 'src/services/user/user.service';
import { ControllerModule } from '../controller.module';
import { PostServiceData } from './mocks/post-service.data';
import { PostServiceMock } from './mocks/post-service.mock';
import { UserServiceData } from './mocks/user-service.data';
import { UserServiceMock } from './mocks/user-service.mock';
import { Server } from 'http';
import { CreateUserTestBuilder, ParameterManager } from './test-builder/create-user.test-builder';
import { UserServiceObservableMock } from './mocks/user-service-observable.mock';

describe('Rest API Controller', () => {
  let app: INestApplication;
  let server: Server;
  let userService: UserServiceObservableMock;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ControllerModule],
    })
      .overrideProvider(UserService)
      .useValue(new UserServiceObservableMock(new UserServiceMock()))
      .compile();

    userService = module.get<UserServiceObservableMock>(UserService);

    app = module.createNestApplication();
    await app.init();

    server = app.getHttpServer();
  });

  describe('POST /api/users, `createUser`', () => {
    const createUserTestBuilder = new CreateUserTestBuilder(expect, request, '/api/users');
    const paramters = createUserTestBuilder.getParameters();

    beforeAll(() => {
      createUserTestBuilder.setUserService(userService);
      createUserTestBuilder.setServer(server);
    });

    describe.each(paramters)(
      'When a user with in parameterId: `$id` and parameterType: `$type` type is being created',
      (parameter) => {
        let requestBody: any;
        let parameterManager: ParameterManager;

        let actualStatusCode: number;
        let actualResponseBody: any;

        let expectedStatusCode: number;
        let expectedResponseBody: any;

        let actualReturnedUserFromUserService: any;
        let expectedReturnedUserFromUserService: any;

        beforeAll(async () => {
          parameterManager = createUserTestBuilder.getParameterManager(parameter);
          requestBody = parameterManager.getRequestBody();
          await createUserTestBuilder.sendRequest(requestBody);

          actualStatusCode = createUserTestBuilder.getStatusCode();
          expectedStatusCode = parameterManager.getExpectedStatusCode();

          actualResponseBody = createUserTestBuilder.getResponseBody();
          expectedResponseBody = parameterManager.getExpectedResponseBody();

          actualReturnedUserFromUserService =
            createUserTestBuilder.getReturnedUserFromUserService();

          expectedReturnedUserFromUserService =
            parameterManager.getExpectedReturnedUserFromUserService();
        });

        it('should return correct response status code', () => {
          expect(actualStatusCode).toBe(expectedStatusCode);
        });
        it('should return correct response body', () => {
          expect(actualResponseBody).toEqual(expectedResponseBody);
        });

        it('should have id coming or not from `UserService`', () => {
          expect(actualReturnedUserFromUserService).toEqual(expectedReturnedUserFromUserService);
        });
      },
    );
  });

  // TODO: Implement authorization using JWT
  // describe('POST /api/posts, `createPost`', () => {
  //   const createPostTestBuilder = new CreatePostTestBuilder();

  //   const validParameters = createPostTestBuilder.getValidParameters();
  //   const inValidParameters = createPostTestBuilder.getInValidParameters();

  //   describe.each(validParameters)(
  //     'When a user with valid details in parameter id $id is being created',
  //     (parameter) => {
  //       let requestBody: any;
  //       let response: request.Response;

  //       beforeAll(async () => {
  //         requestBody = createPostTestBuilder.getRequestBody(parameter);
  //         response = await createPostTestBuilder.sendRequest(requestBody);
  //       });

  //       it('should return correct response status code', () => {
  //         expect(response.statusCode).toBe(201);
  //       });
  //       it('should return correct response body', () => {
  //         const actualResponseBody = response.body;
  //         const expectedResponseBody = createPostTestBuilder.getExpectedResponseBody(parameter);

  //         expect(actualResponseBody).toEqual(expectedResponseBody);
  //       });
  //     },
  //   );

  //   describe.each(inValidParameters)(
  //     'When a user with invalid details in parameter id $id is being created',
  //     (parameter) => {
  //       let requestBody: any;
  //       let response: request.Response;

  //       beforeAll(async () => {
  //         requestBody = createPostTestBuilder.getRequestBody(parameter);
  //         response = await createPostTestBuilder.sendRequest(requestBody);
  //       });

  //       it('should return correct response status code', () => {
  //         expect(response.statusCode).toBe(401);
  //       });

  //       it('should return correct response body', () => {
  //         const actualResponseBody = response.body;
  //         const expectedResponseBody = createPostTestBuilder.getExpectedResponseBody(parameter);

  //         expect(actualResponseBody).toEqual(expectedResponseBody);
  //       });
  //     },
  //   );
  // });

  // describe('GET /api/posts, `getPosts`', () => {
  //   const getPostsTestBuilder = new GetPostsTestBuilder();

  //   const validParameters = getPostsTestBuilder.getValidParameters();
  //   const inValidParameters = getPostsTestBuilder.getInValidParameters();

  //   describe.each(validParameters)(
  //     'When a user with valid details in parameter id $id is being created',
  //     (parameter) => {
  //       let requestBody: any;
  //       let response: request.Response;

  //       beforeAll(async () => {
  //         requestBody = getPostsTestBuilder.getRequestBody(parameter);
  //         response = await getPostsTestBuilder.sendRequest(requestBody);
  //       });

  //       it('should return correct response status code', () => {
  //         expect(response.statusCode).toBe(201);
  //       });
  //       it('should return correct response body', () => {
  //         const actualResponseBody = response.body;
  //         const expectedResponseBody = getPostsTestBuilder.getExpectedResponseBody(parameter);

  //         expect(actualResponseBody).toEqual(expectedResponseBody);
  //       });
  //     },
  //   );

  //   describe.each(inValidParameters)(
  //     'When a user with invalid details in parameter id $id is being created',
  //     (parameter) => {
  //       let requestBody: any;
  //       let response: request.Response;

  //       beforeAll(async () => {
  //         requestBody = getPostsTestBuilder.getRequestBody(parameter);
  //         response = await getPostsTestBuilder.sendRequest(requestBody);
  //       });

  //       it('should return correct response status code', () => {
  //         expect(response.statusCode).toBe(401);
  //       });

  //       it('should return correct response body', () => {
  //         const actualResponseBody = response.body;
  //         const expectedResponseBody = getPostsTestBuilder.getExpectedResponseBody(parameter);

  //         expect(actualResponseBody).toEqual(expectedResponseBody);
  //       });
  //     },
  //   );
  // });

  // describe('PUT /api/posts, `updatePost`', () => {
  //   const updatePostTestBuilder = new UpdatePostTestBuilder();

  //   const validParameters = updatePostTestBuilder.getValidParameters();
  //   const inValidParameters = updatePostTestBuilder.getInValidParameters();

  //   describe.each(validParameters)(
  //     'When a user with valid details in parameter id $id is being created',
  //     (parameter) => {
  //       let requestBody: any;
  //       let response: request.Response;

  //       beforeAll(async () => {
  //         requestBody = updatePostTestBuilder.getRequestBody(parameter);
  //         response = await updatePostTestBuilder.sendRequest(requestBody);
  //       });

  //       it('should return correct response status code', () => {
  //         expect(response.statusCode).toBe(201);
  //       });
  //       it('should return correct response body', () => {
  //         const actualResponseBody = response.body;
  //         const expectedResponseBody = updatePostTestBuilder.getExpectedResponseBody(parameter);

  //         expect(actualResponseBody).toEqual(expectedResponseBody);
  //       });
  //     },
  //   );

  //   describe.each(inValidParameters)(
  //     'When a user with invalid details in parameter id $id is being created',
  //     (parameter) => {
  //       let requestBody: any;
  //       let response: request.Response;

  //       beforeAll(async () => {
  //         requestBody = updatePostTestBuilder.getRequestBody(parameter);
  //         response = await updatePostTestBuilder.sendRequest(requestBody);
  //       });

  //       it('should return correct response status code', () => {
  //         expect(response.statusCode).toBe(401);
  //       });

  //       it('should return correct response body', () => {
  //         const actualResponseBody = response.body;
  //         const expectedResponseBody = updatePostTestBuilder.getExpectedResponseBody(parameter);

  //         expect(actualResponseBody).toEqual(expectedResponseBody);
  //       });
  //     },
  //   );
  // });

  // describe('DELETE /api/posts, `deletePost`', () => {
  //   const deletePostTestBuilder = new DeletePostTestBuilder();

  //   const validParameters = deletePostTestBuilder.getValidParameters();
  //   const inValidParameters = deletePostTestBuilder.getInValidParameters();
  //   const authorizedUserParameter;

  //   describe.each(validParameters)(
  //     'When a user with valid details in parameter id $id is being created',
  //     (parameter) => {
  //       let requestBody: any;
  //       let response: request.Response;

  //       beforeAll(async () => {
  //         requestBody = deletePostTestBuilder.getRequestBody(parameter);
  //         response = await deletePostTestBuilder.sendRequest(requestBody);
  //       });

  //       it('should return correct response status code', () => {
  //         expect(response.statusCode).toBe(201);
  //       });
  //       it('should return correct response body', () => {
  //         const actualResponseBody = response.body;
  //         const expectedResponseBody = deletePostTestBuilder.getExpectedResponseBody(parameter);

  //         expect(actualResponseBody).toEqual(expectedResponseBody);
  //       });
  //     },
  //   );

  //   describe.each(inValidParameters)(
  //     'When a user with invalid details in parameter id $id is being created',
  //     (parameter) => {
  //       let requestBody: any;
  //       let response: request.Response;

  //       beforeAll(async () => {
  //         requestBody = deletePostTestBuilder.getRequestBody(parameter);
  //         response = await deletePostTestBuilder.sendRequest(requestBody);
  //       });

  //       it('should return correct response status code', () => {
  //         expect(response.statusCode).toBe(401);
  //       });

  //       it('should return correct response body', () => {
  //         const actualResponseBody = response.body;
  //         const expectedResponseBody = deletePostTestBuilder.getExpectedResponseBody(parameter);

  //         expect(actualResponseBody).toEqual(expectedResponseBody);
  //       });
  //     },
  //   );
  // });

  afterAll(async () => {
    await app.close();
  });
});
