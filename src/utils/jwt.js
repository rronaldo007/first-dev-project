import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

export const jwttoken = {
    sign: (payload) => {
        try {
            return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        } catch (error) {
            console.error('Failed to authenticate token', error);
            throw new Error('Failed to authenticate token');
        }
    },
    verify: (token) => {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            console.error('Failed to verify token', error);
            throw new Error('Failed to verify token');
        }
    }
};