import mongoose from 'mongoose';

export type Doc<T> = T & { _id: mongoose.Types.ObjectId };
