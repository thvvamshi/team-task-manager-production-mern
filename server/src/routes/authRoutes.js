import { Router } from 'express';
import { listUsers, login, me, signup } from '../controllers/authController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { loginSchema, signupSchema } from '../validators/authSchemas.js';

export const authRouter = Router();

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Create a new user account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, example: "Asha Admin" }
 *               email: { type: string, example: "admin@example.com" }
 *               password: { type: string, example: "Admin123!" }
 *               role: { type: string, enum: [Admin, Member] }
 *     responses:
 *       201:
 *         description: User created
 */
authRouter.post('/signup', validate(signupSchema), signup);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login and receive a JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: "admin@example.com" }
 *               password: { type: string, example: "Admin123!" }
 *     responses:
 *       200:
 *         description: Login successful
 */
authRouter.post('/login', validate(loginSchema), login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user
 */
authRouter.get('/me', requireAuth, me);

/**
 * @swagger
 * /api/auth/users:
 *   get:
 *     summary: List users for project assignment
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User list
 */
authRouter.get('/users', requireAuth, requireRole('Admin'), listUsers);

