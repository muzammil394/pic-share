import { Request, Response } from 'express';
import User from '../models/User';
import Image from '../models/Image';
import { IUser } from '../models/User';

interface AuthenticatedRequest extends Request {
    user?: IUser;
}

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user?._id) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const posts = await Image.find({ uploaderId: req.user._id })
            .populate('uploaderId', 'username')
            .populate('likes', 'username')
            .populate('comments.user', 'username')
            .sort({ createdAt: -1 });

        // Transform posts to include image URLs
        const transformedPosts = posts.map(post => {
            const postObj = post.toObject();
            return {
                ...postObj,
                imageUrl: `data:${post.image.contentType};base64,${post.image.data.toString('base64')}`
            };
        });

        res.json({
            user,
            posts: transformedPosts
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ message: 'Error fetching profile' });
    }
};