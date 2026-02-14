import express, { Request, Response } from 'express';
import auth from '../middleware/auth';
import Attendance from '../models/Attendance';

const router = express.Router();

// @route   POST api/attendance
// @desc    Mark attendance for today
// @access  Private
router.post('/', auth, async (req: Request, res: Response) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // FIX: Cast req to 'any' to access .user
    const userId = (req as any).user.id; 

    const newAttendance = new Attendance({
      userId: userId,
      date: today,
      status: 'Present'
    });

    const attendance = await newAttendance.save();
    res.json(attendance);
  } catch (err: any) {
    if(err.code === 11000) {
      return res.status(400).json({ msg: 'Attendance already marked for today' });
    }
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/attendance
// @desc    Get all attendance for user
// @access  Private
router.get('/', auth, async (req: Request, res: Response) => {
  try {
    // FIX: Cast req to 'any' here too
    const userId = (req as any).user.id;

    const history = await Attendance.find({ userId: userId }).sort({ date: -1 });
    res.json(history);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;