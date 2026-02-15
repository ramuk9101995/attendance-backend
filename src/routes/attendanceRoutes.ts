import { Router } from 'express';
import * as attendanceController from '../controllers/attendanceController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { checkInSchema, checkOutSchema } from '../validators/schemas';

const router = Router();

/**
 * @route   POST /api/attendance/checkin
 * @desc    Check in for the day
 * @access  Private
 */
router.post('/checkin', authenticate, validate(checkInSchema), attendanceController.checkIn);

/**
 * @route   POST /api/attendance/checkout
 * @desc    Check out for the day
 * @access  Private
 */
router.post('/checkout', authenticate, validate(checkOutSchema), attendanceController.checkOut);

/**
 * @route   GET /api/attendance/today
 * @desc    Get today's attendance record
 * @access  Private
 */
router.get('/today', authenticate, attendanceController.getTodayAttendance);

/**
 * @route   GET /api/attendance/history
 * @desc    Get attendance history
 * @access  Private
 */
router.get('/history', authenticate, attendanceController.getAttendanceHistory);

/**
 * @route   GET /api/attendance/debug
 * @desc    Debug endpoint - shows all attendance data for current user
 * @access  Private
 * @note    REMOVE THIS IN PRODUCTION
 */
router.get('/debug', authenticate, attendanceController.debugAttendance);

/**
 * @route   DELETE /api/attendance/cleanup
 * @desc    Delete all attendance records for current user (for testing)
 * @access  Private
 * @note    REMOVE THIS IN PRODUCTION or add admin check
 */
router.delete('/cleanup', authenticate, attendanceController.cleanupAttendance);

export default router;