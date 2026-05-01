import { z } from 'zod';
import { objectId } from './common.js';

export const taskQuerySchema = z.object({
  query: z.object({
    project: objectId.optional(),
    status: z.enum(['Todo', 'In Progress', 'Done']).optional(),
    assignedTo: objectId.optional()
  })
});

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2).max(160),
    description: z.string().trim().max(1200).optional(),
    project: objectId,
    assignedTo: objectId,
    status: z.enum(['Todo', 'In Progress', 'Done']).optional(),
    priority: z.enum(['Low', 'Medium', 'High']).optional(),
    dueDate: z.coerce.date()
  })
});

export const updateTaskSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    title: z.string().trim().min(2).max(160).optional(),
    description: z.string().trim().max(1200).optional(),
    assignedTo: objectId.optional(),
    status: z.enum(['Todo', 'In Progress', 'Done']).optional(),
    priority: z.enum(['Low', 'Medium', 'High']).optional(),
    dueDate: z.coerce.date().optional()
  })
});
