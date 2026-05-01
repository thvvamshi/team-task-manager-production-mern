import { z } from 'zod';
import { objectId } from './common.js';

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120),
    description: z.string().trim().max(1000).optional()
  })
});

export const updateProjectSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    name: z.string().trim().min(2).max(120).optional(),
    description: z.string().trim().max(1000).optional(),
    status: z.enum(['Active', 'Completed', 'Archived']).optional()
  })
});

export const memberSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    userId: objectId,
    role: z.enum(['Admin', 'Member']).default('Member')
  })
});

export const removeMemberSchema = z.object({
  params: z.object({
    id: objectId,
    userId: objectId
  })
});
