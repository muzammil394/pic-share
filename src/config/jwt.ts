import { sign, verify } from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
export const JWT_EXPIRES_IN = '24h';

export const generateToken = (userId: string) => {
    return sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string) => {
    try {
        return verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};