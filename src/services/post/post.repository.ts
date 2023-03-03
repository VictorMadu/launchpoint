import { Injectable } from '@nestjs/common';
import { InjectModel, Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model, UpdateWriteOpResult } from 'mongoose';
import { AtLeastOne } from 'ts-util-types';
import { UpdatedColumnResult } from '../common/mongo/updated-column-result';
import Pagination from '../common/types/pagination';

@Schema()
export class Post {
  @Prop()
  creatorUserId: string;

  @Prop()
  title: string;

  @Prop()
  content: string;

  @Prop()
  createdAt: Date;

  @Prop()
  lastUpdatedAt: Date;

  @Prop()
  deletedAt: Date;
}

export const postSchema = SchemaFactory.createForClass(Post);

export type PostDocument = HydratedDocument<Post>;

type InPost = Omit<Post, 'deletedAt'>;

@Injectable()
export class PostRepository {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  async insertOne(post: InPost): Promise<string> {
    const { _id } = await this.postModel.create(post);
    return _id.toString();
  }

  async updateOne(
    postId: string,
    postUpdate: AtLeastOne<Pick<Post, 'content' | 'title'>> & Pick<Post, 'lastUpdatedAt'>,
  ): Promise<UpdatedColumnResult> {
    const updateResult: UpdateWriteOpResult = await this.postModel.updateOne(
      {
        _id: new mongoose.Types.ObjectId(postId),
        deletedAt: { $eq: null },
      },
      {
        $set: postUpdate,
      },
    );

    return new UpdatedColumnResult(updateResult);
  }

  async deleteOne(postId: string): Promise<UpdatedColumnResult> {
    const updateResult: UpdateWriteOpResult = await this.postModel.updateOne(
      {
        _id: new mongoose.Types.ObjectId(postId),
        deletedAt: { $eq: null },
      },
      {
        $set: { deletedAt: new Date() },
      },
    );

    return new UpdatedColumnResult(updateResult);
  }

  async findOneById(postId: string): Promise<(InPost & { postId: string }) | undefined> {
    const aggResult = await this.postModel.aggregate([
      {
        $match: {
          deletedAt: { $eq: null },
          _id: new mongoose.Types.ObjectId(postId),
        },
      },
      {
        $project: {
          postId: { $toString: '$_id' },
          creatorUserId: '$creatorUserId',
          title: '$title',
          content: '$content',
          createdAt: '$createdAt',
          lastUpdatedAt: '$lastUpdatedAt',
        },
      },
    ]);
    return aggResult[0];
  }

  async findMany(pagination: Pagination): Promise<(InPost & { postId: string })[]> {
    return this.postModel.aggregate([
      {
        $match: {
          deletedAt: { $eq: null },
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: pagination.offset },
      { $limit: pagination.limit },
      {
        $project: {
          postId: { $toString: '$_id' },
          creatorUserId: '$creatorUserId',
          title: '$title',
          content: '$content',
          createdAt: '$createdAt',
          lastUpdatedAt: '$lastUpdatedAt',
        },
      },
    ]);
  }

  async getTotalActivePosts(): Promise<number> {
    const aggResult = await this.postModel.aggregate([
      {
        $match: {
          deletedAt: { $eq: null },
        },
      },
      { $group: { _id: null, total: { $sum: 1 } } },
    ]);

    console.log('aggResult', aggResult[0]?.total);

    return aggResult[0]?.total ?? 0;
  }

  async clearDb() {
    await this.postModel.deleteMany({});
  }
}
