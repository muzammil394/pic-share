import express from 'express';
import { authenticate } from '../middleware/auth';
import { getProfile } from '../controllers/users';

const router = express.Router();

// Define profile route
router.get('/profile', authenticate, getProfile);

export default router;