import { Router } from 'express';
import {
  addProjectMember,
  createProject,
  deleteProject,
  getProject,
  listProjects,
  removeProjectMember,
  updateProject
} from '../controllers/projectController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { loadProject, requireProjectAdmin, requireProjectMember } from '../middleware/projectAccess.js';
import { validate } from '../middleware/validate.js';
import {
  createProjectSchema,
  memberSchema,
  removeMemberSchema,
  updateProjectSchema
} from '../validators/projectSchemas.js';

export const projectRouter = Router();

projectRouter.use(requireAuth);

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: List accessible projects
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Project list
 *   post:
 *     summary: Create a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, example: "Website Launch" }
 *               description: { type: string, example: "Tasks for the public launch" }
 *     responses:
 *       201:
 *         description: Project created
 */
projectRouter.get('/', listProjects);
projectRouter.post('/', requireRole('Admin'), validate(createProjectSchema), createProject);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get project details
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Project details
 *   patch:
 *     summary: Update project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Project updated
 *   delete:
 *     summary: Delete project and its tasks
 *     tags: [Projects]
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
projectRouter.get('/:id', loadProject, requireProjectMember, getProject);
projectRouter.patch('/:id', validate(updateProjectSchema), loadProject, requireProjectAdmin, updateProject);
projectRouter.delete('/:id', loadProject, requireProjectAdmin, deleteProject);

/**
 * @swagger
 * /api/projects/{id}/members:
 *   post:
 *     summary: Add or update a project member
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId: { type: string }
 *               role: { type: string, enum: [Admin, Member] }
 *     responses:
 *       200:
 *         description: Project member saved
 */
projectRouter.post('/:id/members', validate(memberSchema), loadProject, requireProjectAdmin, addProjectMember);

/**
 * @swagger
 * /api/projects/{id}/members/{userId}:
 *   delete:
 *     summary: Remove project member
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Project member removed
 */
projectRouter.delete(
  '/:id/members/:userId',
  validate(removeMemberSchema),
  loadProject,
  requireProjectAdmin,
  removeProjectMember
);

