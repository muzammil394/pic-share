import { Document, Types } from 'mongoose';

export interface IComment {
  user: Types.ObjectId;
  text: string;
  createdAt: Date;
}

export interface IImage extends Document {
  caption: string;
  imageUrl: string;
  uploaderId: Types.ObjectId;
  likes: Types.ObjectId[];
  comments: IComment[];
  createdAt: Date;
}

export interface IUser extends Document {
  username: string;
  email: string;
  createdAt: Date;
}