import { Router } from 'express';
import * as taskController from '../controllers/taskController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createTaskSchema, updateTaskSchema } from '../validators/schemas';

const router = Router();

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private
 */
router.post('/', authenticate, validate(createTaskSchema), taskController.createTask);

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks for the authenticated user
 * @access  Private
 */
router.get('/', authenticate, taskController.getTasks);

/**
 * @route   GET /api/tasks/:id
 * @desc    Get a specific task by ID
 * @access  Private
 */
router.get('/:id', authenticate, taskController.getTaskById);

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update a task
 * @access  Private
 */
router.put('/:id', authenticate, validate(updateTaskSchema), taskController.updateTask);

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task
 * @access  Private
 */
router.delete('/:id', authenticate, taskController.deleteTask);

export default router;
