import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';

export interface IImage extends Document {
    caption: string;
    image: {
        data: Buffer;
        contentType: string;
    };
    uploaderId: IUser['_id'];
    likes: IUser['_id'][];
    comments: Array<{
        text: string;
        user: IUser['_id'];
        createdAt: Date;
    }>;
    createdAt: Date;
}

const imageSchema = new Schema({
    caption: { type: String, required: true },
    image: {
        data: Buffer,
        contentType: String
    },
    uploaderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    comments: [{
        text: { type: String, required: true },
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        createdAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IImage>('Image', imageSchema);