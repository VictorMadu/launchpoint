import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Put,
} from '@nestjs/common';
import { UserErrorReason } from 'src/services/user/user.error';
import { User, UserService } from 'src/services/user/user.service';
import { CreateUserDto } from './dtos/create-user';

@Controller('api')
export class RestController {
  constructor(private userService: UserService) {}

  @Post('users')
  async createUser(@Body() createUserDto: CreateUserDto) {
    const creationResult = await this.userService.createUser(createUserDto);

    switch (creationResult.getErrorReason()) {
      case UserErrorReason.DUPLICATE_EMAIL:
        throw new HttpException('INVALID_EMAIL', HttpStatus.BAD_REQUEST);

      default:
        const user = creationResult.getUser() as User;
        return {
          userId: user.userId,
          email: user.email,
          createdAt: user.createdAt,
        };
    }
  }

  @Post('posts')
  async createPost() {
    return;
  }

  @Get('posts')
  async getPosts() {
    return;
  }

  @Put('posts')
  async updatePosts() {
    return;
  }

  @Delete('posts')
  async deletePost() {
    return;
  }
}
