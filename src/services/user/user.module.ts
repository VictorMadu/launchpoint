import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from 'src/config';
import { User, UserRepository, userSchema } from './user.repository';
import { UserService } from './user.service';

@Module({
  imports: [
    MongooseModule.forRoot(config.db.url),
    MongooseModule.forFeature([{ name: User.name, schema: userSchema }]),
  ],
  providers: [UserService, UserRepository],
})
export class UserModule {}
