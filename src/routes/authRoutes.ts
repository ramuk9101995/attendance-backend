import { Router } from 'express';
import * as authController from '../controllers/authController';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { signupSchema, loginSchema } from '../validators/schemas';

const router = Router();

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post('/signup', validate(signupSchema), authController.signup);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticate, authController.getProfile);

export default router;
