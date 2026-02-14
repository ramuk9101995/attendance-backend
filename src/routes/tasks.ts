import express, { Request, Response } from 'express';
import auth from '../middleware/auth';
import Task from '../models/Task';

const router = express.Router();

// @route   POST api/tasks
// @desc    Create a task
// @access  Private
router.post('/', auth, async (req: Request, res: Response) => {
  const { title } = req.body;
  try {
    const newTask = new Task({
      title,
      // FIX: Cast req to 'any'
      userId: (req as any).user.id
    });
    const task = await newTask.save();
    res.json(task);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/tasks
// @desc    Get all user tasks
// @access  Private
router.get('/', auth, async (req: Request, res: Response) => {
  try {
    // FIX: Cast req to 'any'
    const tasks = await Task.find({ userId: (req as any).user.id }).sort({ date: -1 });
    res.json(tasks);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/tasks/:id
// @desc    Update task status
// @access  Private
router.put('/:id', auth, async (req: Request, res: Response) => {
  const { status } = req.body;
  try {
    let task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: 'Task not found' });

    // FIX: Cast req to 'any'
    if (task.userId.toString() !== (req as any).user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    task.status = status;
    await task.save();
    res.json(task);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;