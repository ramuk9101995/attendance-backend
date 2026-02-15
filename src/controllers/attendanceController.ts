import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Attendance } from '../models/Attendance';
import { AppError } from '../middleware/errorHandler';

/**
 * Utility to ensure the date string is consistent across all functions.
 * We use local date to avoid UTC "day-flipping" issues.
 */
const getLocalDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Safely convert userId string to MongoDB ObjectId
 */
const toObjectId = (userId: string | undefined): mongoose.Types.ObjectId => {
  if (!userId) {
    throw new AppError('User ID is required', 401);
  }
  
  // Validate ObjectId format before conversion
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError('Invalid user ID format', 400);
  }
  
  return new mongoose.Types.ObjectId(userId);
};

/**
 * @desc    Check-in for today
 * @route   POST /api/attendance/checkin
 */
export const checkIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { notes } = req.body;

    if (!userId) {
      return next(new AppError('User authentication failed', 401));
    }

    const today = getLocalDateString();
    const userObjectId = toObjectId(userId);

    console.log(`[CHECK-IN] ========================================`);
    console.log(`[CHECK-IN] User ID (string): ${userId}`);
    console.log(`[CHECK-IN] User ID (ObjectId): ${userObjectId.toString()}`);
    console.log(`[CHECK-IN] Date: ${today}`);
    console.log(`[CHECK-IN] Attempting check-in for ${today}`);

    // ENHANCED: Check with multiple query variations to find any existing records
    const queries = [
      { user_id: userObjectId, date: today },
      { user_id: userId, date: today },
      { user_id: userObjectId.toString(), date: today }
    ];

    console.log(`[CHECK-IN] Testing ${queries.length} query variations...`);
    
    for (let i = 0; i < queries.length; i++) {
      const testResult = await Attendance.findOne(queries[i]);
      console.log(`[CHECK-IN] Query ${i + 1}:`, JSON.stringify(queries[i]));
      console.log(`[CHECK-IN] Result ${i + 1}:`, testResult ? 'FOUND' : 'NOT FOUND');
      if (testResult) {
        console.log(`[CHECK-IN] Found record details:`, {
          _id: testResult._id,
          user_id: testResult.user_id,
          user_id_type: typeof testResult.user_id,
          date: testResult.date,
          check_in_time: testResult.check_in_time
        });
      }
    }

    // Use the standard query
    const existing = await Attendance.findOne({ 
      user_id: userObjectId, 
      date: today 
    });

    if (existing) {
      console.log(`[CHECK-IN] ❌ DUPLICATE DETECTED - User ${userId} already checked in for ${today}`);
      console.log(`[CHECK-IN] Existing record ID: ${existing._id}`);
      return next(new AppError('You have already checked in today', 400));
    }

    // Check for ANY attendance today for this user (debugging)
    const anyToday = await Attendance.find({ 
      user_id: userObjectId
    }).sort({ date: -1 }).limit(5);
    
    console.log(`[CHECK-IN] Recent attendance records for user:`, anyToday.length);
    anyToday.forEach((record, idx) => {
      console.log(`[CHECK-IN] Record ${idx + 1}: date=${record.date}, id=${record._id}`);
    });

    // Create the attendance record
    const attendance = await Attendance.create({
      user_id: userObjectId,
      date: today,
      check_in_time: new Date(),
      status: 'present',
      notes: notes || null,
    });

    console.log(`[CHECK-IN] ✅ SUCCESS - User ${userId} checked in for ${today}`);
    console.log(`[CHECK-IN] New record ID: ${attendance._id}`);
    console.log(`[CHECK-IN] ========================================`);

    // Set aggressive no-cache headers
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.status(201).json({
      success: true,
      message: 'Check-in successful',
      data: { attendance },
    });
  } catch (error) {
    // Handling MongoDB unique index collision (user_id + date)
    if ((error as any).code === 11000) {
      console.log(`[CHECK-IN] ❌ DUPLICATE KEY ERROR for user ${req.user?.userId}`);
      console.log(`[CHECK-IN] Error details:`, (error as any).message);
      return next(new AppError('You have already checked in today', 400));
    }
    console.error(`[CHECK-IN] ❌ UNEXPECTED ERROR:`, error);
    next(error);
  }
};

/**
 * @desc    Get current user's attendance status for today
 * @route   GET /api/attendance/today
 */
export const getTodayAttendance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    const today = getLocalDateString();
    const userObjectId = toObjectId(userId);

    console.log(`[GET TODAY] ========================================`);
    console.log(`[GET TODAY] User ID (string): ${userId}`);
    console.log(`[GET TODAY] User ID (ObjectId): ${userObjectId.toString()}`);
    console.log(`[GET TODAY] Date: ${today}`);
    console.log(`[GET TODAY] Fetching attendance for user ${userId} on ${today}`);

    // ENHANCED: Try multiple query variations
    const queries = [
      { user_id: userObjectId, date: today },
      { user_id: userId, date: today },
      { user_id: userObjectId.toString(), date: today }
    ];

    console.log(`[GET TODAY] Testing ${queries.length} query variations...`);
    
    for (let i = 0; i < queries.length; i++) {
      const testResult = await Attendance.findOne(queries[i]);
      console.log(`[GET TODAY] Query ${i + 1}:`, JSON.stringify(queries[i]));
      console.log(`[GET TODAY] Result ${i + 1}:`, testResult ? 'FOUND' : 'NOT FOUND');
      if (testResult) {
        console.log(`[GET TODAY] Found record details:`, {
          _id: testResult._id,
          user_id: testResult.user_id,
          user_id_type: typeof testResult.user_id,
          date: testResult.date
        });
      }
    }

    // Query using the casted ObjectId (standard query)
    const attendance = await Attendance.findOne({ 
      user_id: userObjectId, 
      date: today 
    }).lean();

    console.log(`[GET TODAY] Standard query result: ${attendance ? 'FOUND ✅' : 'NOT FOUND ❌'}`);
    
    if (attendance) {
      console.log(`[GET TODAY] Attendance details:`, {
        _id: attendance._id,
        user_id: attendance.user_id,
        date: attendance.date,
        check_in_time: attendance.check_in_time,
        check_out_time: attendance.check_out_time
      });
    }

    // Also check recent records for debugging
    const recentRecords = await Attendance.find({ 
      user_id: userObjectId 
    }).sort({ date: -1 }).limit(3).lean();
    
    console.log(`[GET TODAY] Recent attendance records: ${recentRecords.length}`);
    recentRecords.forEach((record, idx) => {
      console.log(`[GET TODAY] Recent ${idx + 1}: date=${record.date}, id=${record._id}`);
    });

    console.log(`[GET TODAY] ========================================`);

    // Set aggressive no-cache headers to prevent 304 responses
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('ETag', `"${Date.now()}"`); // Dynamic ETag to prevent caching

    res.status(200).json({
      success: true,
      data: { 
        attendance: attendance || null,
        hasCheckedIn: !!attendance,
        date: today
      },
    });
  } catch (error) {
    console.error(`[GET TODAY] ❌ ERROR for user ${req.user?.userId}:`, error);
    next(error);
  }
};

/**
 * @desc    Check-out for today
 * @route   PUT /api/attendance/checkout
 */
export const checkOut = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { notes } = req.body;

    if (!userId) {
      return next(new AppError('User authentication failed', 401));
    }

    const today = getLocalDateString();
    const userObjectId = toObjectId(userId);

    console.log(`[CHECK-OUT] User ${userId} attempting check-out for ${today}`);

    const attendance = await Attendance.findOne({ 
      user_id: userObjectId, 
      date: today 
    });

    if (!attendance) {
      console.log(`[CHECK-OUT] ❌ No check-in record found for user ${userId} on ${today}`);
      return next(new AppError('No check-in record found for today. Please check in first.', 404));
    }

    if (attendance.check_out_time) {
      console.log(`[CHECK-OUT] ❌ User ${userId} already checked out for ${today}`);
      return next(new AppError('You have already checked out today', 400));
    }

    attendance.check_out_time = new Date();
    if (notes) attendance.notes = notes;
    await attendance.save();

    console.log(`[CHECK-OUT] ✅ User ${userId} successfully checked out for ${today}`);

    // Set aggressive no-cache headers
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.status(200).json({
      success: true,
      message: 'Check-out successful',
      data: { attendance },
    });
  } catch (error) {
    console.error(`[CHECK-OUT] ❌ ERROR for user ${req.user?.userId}:`, error);
    next(error);
  }
};

/**
 * @desc    Get user's attendance history
 * @route   GET /api/attendance/history
 */
export const getAttendanceHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError('User authentication failed', 401));
    }

    const userObjectId = toObjectId(userId);
    const limit = parseInt(req.query.limit as string) || 30;
    const offset = parseInt(req.query.offset as string) || 0;

    console.log(`[HISTORY] Fetching history for user ${userId} (limit: ${limit}, offset: ${offset})`);

    const [attendanceRecords, total] = await Promise.all([
      Attendance.find({ user_id: userObjectId })
        .sort({ date: -1 })
        .limit(limit)
        .skip(offset)
        .lean(),
      Attendance.countDocuments({ user_id: userObjectId }),
    ]);

    console.log(`[HISTORY] Found ${attendanceRecords.length} records for user ${userId} (total: ${total})`);

    // Set cache headers
    res.setHeader('Cache-Control', 'private, max-age=60'); // Cache for 1 minute for history

    res.status(200).json({
      success: true,
      data: {
        attendance: attendanceRecords,
        pagination: { total, limit, offset },
      },
    });
  } catch (error) {
    console.error(`[HISTORY] ❌ ERROR for user ${req.user?.userId}:`, error);
    next(error);
  }
};

/**
 * @desc    Debug endpoint - Get all attendance records for current user
 * @route   GET /api/attendance/debug
 * @access  Private (REMOVE IN PRODUCTION)
 */
export const debugAttendance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError('User authentication failed', 401));
    }

    const userObjectId = toObjectId(userId);
    const today = getLocalDateString();

    // Get all records for this user
    const allRecords = await Attendance.find({ user_id: userObjectId }).lean();
    
    // Get today's record with multiple query attempts
    const todayQueries = [
      { user_id: userObjectId, date: today },
      { user_id: userId, date: today },
      { user_id: userObjectId.toString(), date: today }
    ];

    const todayResults = await Promise.all(
      todayQueries.map(query => Attendance.findOne(query).lean())
    );

    res.status(200).json({
      success: true,
      debug: {
        userId: userId,
        userIdType: typeof userId,
        userObjectId: userObjectId.toString(),
        today: today,
        totalRecords: allRecords.length,
        allRecords: allRecords.map(r => ({
          _id: r._id,
          user_id: r.user_id,
          user_id_type: typeof r.user_id,
          date: r.date,
          check_in_time: r.check_in_time
        })),
        todayQueries: todayQueries.map((query, idx) => ({
          query: query,
          found: !!todayResults[idx],
          result: todayResults[idx] || null
        }))
      }
    });
  } catch (error) {
    console.error('[DEBUG] Error:', error);
    next(error);
  }
};

/**
 * @desc    Delete all attendance records for current user (cleanup)
 * @route   DELETE /api/attendance/cleanup
 * @access  Private
 */
export const cleanupAttendance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next(new AppError('User authentication failed', 401));
    }

    const userObjectId = toObjectId(userId);

    const result = await Attendance.deleteMany({ user_id: userObjectId });

    console.log(`[CLEANUP] Deleted ${result.deletedCount} records for user ${userId}`);

    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} attendance records`,
      data: { deletedCount: result.deletedCount }
    });
  } catch (error) {
    console.error('[CLEANUP] Error:', error);
    next(error);
  }
};