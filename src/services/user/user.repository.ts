import { Injectable } from '@nestjs/common';
import { InjectModel, Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model } from 'mongoose';
import { Doc } from '../common/mongo/types/doc';
import { UserErrorReason } from './user.error';

@Schema()
export class User {
  @Prop({ unique: true })
  email: string;

  @Prop()
  createdAt: Date;
}

export const userSchema = SchemaFactory.createForClass(User);

export type UserDocument = HydratedDocument<User>;

type InUser = User;

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async insertOne(user: Pick<InUser, 'email'>): Promise<InsertOneResult> {
    try {
      const userDoc: Doc<User> = await this.userModel.create({
        ...user,
        createdAt: new Date(),
      });
      const userEntity = this.transformDocToUserEntity(userDoc);

      return { errorReason: null, user: userEntity };
    } catch (error) {
      return {
        errorReason: UserErrorReason.DUPLICATE_EMAIL,
        user: null,
      };
    }
  }

  async findOneById(userId: string): Promise<FindOneByIdResult> {
    const aggResult = await this.userModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(userId),
        },
      },
    ]);
    const userDoc = aggResult[0];

    if (userDoc == null) {
      return { isUserFound: false, user: null };
    } else {
      return { isUserFound: true, user: this.transformDocToUserEntity(userDoc) };
    }
  }

  async clearDb() {
    await this.userModel.deleteMany({});
  }

  private transformDocToUserEntity(userDoc: Doc<User>) {
    return {
      userId: userDoc._id.toString(),
      email: userDoc.email,
      createdAt: userDoc.createdAt,
    };
  }
}

export interface InsertOneResult<IsError extends boolean = boolean> {
  errorReason: IsError extends true ? UserErrorReason : null;
  user: IsError extends true ? null : InUser & { userId: string };
}

export interface FindOneByIdResult<IsFound extends boolean = boolean> {
  isUserFound: IsFound;
  user: IsFound extends true ? InUser & { userId: string } : null;
}
