import { INestApplication } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { PostService } from 'src/services/post/post.service';
import { UserModule } from 'src/services/user/user.module';
import { UserService } from 'src/services/user/user.service';
import { ControllerModule } from '../controller.module';
import { PostServiceData } from './mocks/post-service.data';
import { PostServiceMock } from './mocks/post-service.mock';
import { UserServiceData } from './mocks/user-service.data';
import { UserServiceMock } from './mocks/user-service.mock';

describe('Rest API Controller', () => {
  const userServiceData = new UserServiceData();
  const postServiceData = new PostServiceData();

  let userService: UserService;
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ControllerModule],
    })
      .useMocker((token) => {
        if (token === UserService) {
          return new UserServiceMock(userServiceData);
        }

        if (token === PostService) {
          return new PostServiceMock(postServiceData);
        }
      })
      .compile();

    app = module.createNestApplication();
    await app.init();

    userService = module.get<UserService>(UserService);
  });

  describe('When I create a user with valid details', () => {
    it.each([])('should return correct response', () => {});
  });
});
