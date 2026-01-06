import express from 'express';
import { authenticate } from '../middleware/auth';
import multer from 'multer';
import {
    getImages,
    getImageById,
    uploadImage,
    likeImage,
    commentOnImage,
    deleteImage
} from '../controllers/images';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/', authenticate, getImages);
router.get('/:id', authenticate, getImageById);
router.post('/upload', authenticate, upload.single('file'), uploadImage);
router.post('/:id/like', authenticate, likeImage);
router.post('/:id/comments', authenticate, commentOnImage);
router.delete('/:id', authenticate, deleteImage);

export default router;