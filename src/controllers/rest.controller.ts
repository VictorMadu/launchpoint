import { Controller, Delete, Get, Post, Put } from '@nestjs/common';

@Controller('api')
export class RestController {
  @Post('users')
  async createUser() {}

  @Post('posts')
  async createPost() {}

  @Get('posts')
  async getPosts() {}

  @Put('posts')
  async updatePosts() {}

  @Delete('posts')
  async deletePost() {}
}
