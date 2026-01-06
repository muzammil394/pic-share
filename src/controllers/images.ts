import { Request, Response } from 'express';
import { IUser } from '../models/User';
import ImageModel from '../models/Image';
import { Document } from 'mongoose';
import { isAdmin } from '../config/admin';

interface AuthRequest extends Request {
    user?: IUser;
    file?: Express.Multer.File;
}

interface IImage extends Document {
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

export const uploadImage = async (req: AuthRequest, res: Response) => {
    try {
        // Only admin can upload
        if (!req.user || !isAdmin(req.user.email)) {
            return res.status(403).json({ message: 'Only admin can upload images' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        const newImage = new ImageModel({
            caption: req.body.caption,
            image: {
                data: req.file.buffer,
                contentType: req.file.mimetype
            },
            uploaderId: req.user?._id
        });

        await newImage.save();

        const populatedImage = await ImageModel.findById(newImage._id)
            .populate('uploaderId', 'username')
            .populate('likes', 'username')
            .populate('comments.user', 'username');

        const imageResponse = {
            ...populatedImage?.toObject(),
            imageUrl: `data:${populatedImage?.image.contentType};base64,${populatedImage?.image.data.toString('base64')}`
        };

        res.status(201).json(imageResponse);
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Error uploading image' });
    }
};

export const getImages = async (req: Request, res: Response) => {
    try {
        const images = await ImageModel.find()
            .populate('uploaderId', 'username')
            .populate('likes', 'username')
            .populate('comments.user', 'username')
            .sort({ createdAt: -1 });

        const imagesWithUrls = images.map((image: IImage) => ({
            ...image.toObject(),
            imageUrl: `data:${image.image.contentType};base64,${image.image.data.toString('base64')}`
        }));

        res.json(imagesWithUrls);
    } catch (error) {
        console.error('Fetch error:', error);
        res.status(500).json({ message: 'Error fetching images' });
    }
};

export const getImageById = async (req: Request, res: Response) => {
    try {
        const image = await ImageModel.findById(req.params.id)
            .populate('uploaderId', 'username')
            .populate('likes', 'username')
            .populate('comments.user', 'username');

        if (!image) {
            return res.status(404).json({ message: 'Image not found' });
        }

        res.json(image);
    } catch (error) {
        console.error('Fetch error:', error);
        res.status(500).json({ message: 'Error fetching image' });
    }
};

export const likeImage = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?._id;

        const image = await ImageModel.findById(id);
        if (!image) {
            return res.status(404).json({ message: 'Image not found' });
        }

        const hasLiked = image.likes.includes(userId);

        // Update likes array
        if (hasLiked) {
            image.likes = image.likes.filter(like => like.toString() !== userId?.toString());
        } else {
            image.likes.push(userId);
        }

        await image.save();

        // Fetch updated image with populated fields
        const updatedImage = await ImageModel.findById(id)
            .populate('uploaderId', 'username')
            .populate('likes', 'username')
            .populate('comments.user', 'username');

        if (!updatedImage) {
            return res.status(404).json({ message: 'Image not found after update' });
        }

        // Transform the image to include the imageUrl
        const imageResponse = {
            ...updatedImage.toObject(),
            imageUrl: `data:${updatedImage.image.contentType};base64,${updatedImage.image.data.toString('base64')}`
        };

        res.json(imageResponse);
    } catch (error) {
        console.error('Like error:', error);
        res.status(500).json({ message: 'Error updating like' });
    }
};

export const commentOnImage = async (req: AuthRequest, res: Response) => {
    try {
        const { text } = req.body;
        const image = await ImageModel.findById(req.params.id);
        
        if (!image) {
            return res.status(404).json({ message: 'Image not found' });
        }

        if (!req.user?._id) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        image.comments.push({
            text,
            user: req.user._id,
            createdAt: new Date()
        });

        await image.save();

        const populatedImage = await ImageModel.findById(image._id)
            .populate('uploaderId', 'username')
            .populate('comments.user', 'username')
            .lean();

        if (!populatedImage) {
            return res.status(500).json({ message: 'Error retrieving image' });
        }

        const imageResponse = {
            _id: populatedImage._id,
            caption: populatedImage.caption,
            uploaderId: populatedImage.uploaderId,
            likes: populatedImage.likes,
            comments: populatedImage.comments,
            createdAt: populatedImage.createdAt,
            imageUrl: `data:${populatedImage.image.contentType};base64,${populatedImage.image.data.toString('base64')}`
        };

        res.json(imageResponse);
    } catch (error) {
        console.error('Comment error:', error);
        res.status(500).json({ message: 'Error adding comment' });
    }
};

export const deleteImage = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const image = await ImageModel.findById(id);

        if (!image) {
            return res.status(404).json({ message: 'Image not found' });
        }

        // Check if the user is the owner of the image
        if (image.uploaderId.toString() !== req.user?._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this image' });
        }

        await ImageModel.findByIdAndDelete(id);
        res.json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Delete image error:', error);
        res.status(500).json({ message: 'Error deleting image' });
    }
};