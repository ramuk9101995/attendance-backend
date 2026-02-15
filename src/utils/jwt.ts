import jwt, { SignOptions } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
// Cast to any or the specific StringValue type to satisfy the library
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'];

export interface TokenPayload {
  userId: string; 
  email: string;
  role: string;
}

export const generateToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'attendance-task-system',
  };

  return jwt.sign(payload, JWT_SECRET, options);
};

export const verifyToken = (token: string): TokenPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'attendance-task-system',
    }) as TokenPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const decodeToken = (token: string): TokenPayload | null => {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch (error) {
    return null;
  }
};