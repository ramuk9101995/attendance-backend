import { Request, Response, NextFunction } from 'express'; // Added NextFunction
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { generateToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';

export const signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, full_name } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // Pass the error to next() so the global error handler can send the JSON response
      return next(new AppError('User with this email already exists', 409));
    }

    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const user = await User.create({
      email,
      password_hash,
      full_name,
      role: 'user',
    });

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          created_at: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    // This catches both AppErrors and unexpected system errors
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }

    if (!user.is_active) {
      return next(new AppError('Account is deactivated. Please contact support.', 403));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return next(new AppError('Invalid email or password', 401));
    }

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const user = await User.findById(userId).select('-password_hash');
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          created_at: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};