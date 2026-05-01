import { Router } from 'express';
import { createTask, deleteTask, getTask, listTasks, updateTask } from '../controllers/taskController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { idParamSchema } from '../validators/common.js';
import { createTaskSchema, taskQuerySchema, updateTaskSchema } from '../validators/taskSchemas.js';

export const taskRouter = Router();

taskRouter.use(requireAuth);

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: List tasks with optional filters
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: project
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [Todo, In Progress, Done] }
 *       - in: query
 *         name: assignedTo
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Task list
 *   post:
 *     summary: Create a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, project, assignedTo, dueDate]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               project: { type: string }
 *               assignedTo: { type: string }
 *               status: { type: string, enum: [Todo, In Progress, Done] }
 *               priority: { type: string, enum: [Low, Medium, High] }
 *               dueDate: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: Task created
 */
taskRouter.get('/', validate(taskQuerySchema), listTasks);
taskRouter.post('/', validate(createTaskSchema), createTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get task details
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Task details
 *   patch:
 *     summary: Update task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Task updated
 *   delete:
 *     summary: Delete task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Deleted
 */
taskRouter.get('/:id', validate(idParamSchema), getTask);
taskRouter.patch('/:id', validate(updateTaskSchema), updateTask);
taskRouter.delete('/:id', validate(idParamSchema), deleteTask);

