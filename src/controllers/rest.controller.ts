import { Controller, Delete, Get, Post, Put } from '@nestjs/common';

@Controller('api')
export class RestController {
  @Post('users')
  async createUser() {
    return;
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
