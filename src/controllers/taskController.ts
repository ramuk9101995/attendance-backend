import { Request, Response } from 'express';
import { Task } from '../models/Task';
import { AppError } from '../middleware/errorHandler';

export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { title, description, priority, due_date } = req.body;

    const task = await Task.create({
      user_id: userId,
      title,
      description: description || null,
      priority: priority || 'medium',
      due_date: due_date || null,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: {
        task: {
          id: task._id,
          user_id: task.user_id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          due_date: task.due_date,
          created_at: task.createdAt,
          updated_at: task.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error('Create task error:', error);
    throw new AppError('Failed to create task', 500);
  }
};

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { status, priority } = req.query;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    // Build filter
    const filter: any = { user_id: userId };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    // Custom sort to prioritize by status, then priority, then due_date
    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .sort({
          status: 1, // completed/cancelled last
          priority: 1, // high first
          due_date: 1, // earliest first
          createdAt: -1, // newest first
        })
        .limit(limit)
        .skip(offset)
        .lean(),
      Task.countDocuments(filter),
    ]);

    // Custom sorting logic to match PostgreSQL version
    const sortedTasks = tasks.sort((a, b) => {
      // Sort by status priority
      const statusOrder: any = {
        pending: 1,
        in_progress: 2,
        completed: 3,
        cancelled: 4,
      };
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;

      // Then by priority
      const priorityOrder: any = { high: 1, medium: 2, low: 3 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Then by due_date (nulls last)
      if (a.due_date && b.due_date) {
        return a.due_date.getTime() - b.due_date.getTime();
      }
      if (a.due_date) return -1;
      if (b.due_date) return 1;

      // Finally by created date (newest first)
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    res.status(200).json({
      success: true,
      data: {
        tasks: sortedTasks.map((task) => ({
          id: task._id,
          user_id: task.user_id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          due_date: task.due_date,
          completed_at: task.completed_at,
          created_at: task.createdAt,
          updated_at: task.updatedAt,
        })),
        pagination: {
          total,
          limit,
          offset,
        },
      },
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    throw new AppError('Failed to fetch tasks', 500);
  }
};

export const getTaskById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const task = await Task.findOne({ _id: id, user_id: userId }).lean();

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    res.status(200).json({
      success: true,
      data: {
        task: {
          id: task._id,
          user_id: task.user_id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          due_date: task.due_date,
          completed_at: task.completed_at,
          created_at: task.createdAt,
          updated_at: task.updatedAt,
        },
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Get task error:', error);
    throw new AppError('Failed to fetch task', 500);
  }
};

export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { title, description, status, priority, due_date } = req.body;

    // Find task
    const task = await Task.findOne({ _id: id, user_id: userId });

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    // Update fields
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (due_date !== undefined) task.due_date = due_date;

    // Handle status change
    if (status !== undefined) {
      const oldStatus = task.status;
      task.status = status;

      // Set completed_at when marking as completed
      if (status === 'completed' && oldStatus !== 'completed') {
        task.completed_at = new Date();
      } else if (status !== 'completed') {
        task.completed_at = undefined;
      }
    }

    await task.save();

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: {
        task: {
          id: task._id,
          user_id: task.user_id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          due_date: task.due_date,
          completed_at: task.completed_at,
          created_at: task.createdAt,
          updated_at: task.updatedAt,
        },
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Update task error:', error);
    throw new AppError('Failed to update task', 500);
  }
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const result = await Task.deleteOne({ _id: id, user_id: userId });

    if (result.deletedCount === 0) {
      throw new AppError('Task not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Delete task error:', error);
    throw new AppError('Failed to delete task', 500);
  }
};
