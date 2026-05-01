import { z } from 'zod';

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(5000),
    MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
    JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
    JWT_EXPIRES_IN: z.string().default('7d'),
    CLIENT_URL: z.string().url().default('http://localhost:5173'),
    CORS_ORIGINS: z.string().optional(),
    INITIAL_ADMIN_EMAIL: z.string().email().optional()
  })
  .superRefine((value, context) => {
    if (value.NODE_ENV === 'production' && value.JWT_SECRET.length < 32) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['JWT_SECRET'],
        message: 'JWT_SECRET must be at least 32 characters in production'
      });
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const values = parsed.data;

export const env = {
  ...values,
  isProduction: values.NODE_ENV === 'production',
  corsOrigins: [
    values.CLIENT_URL,
    ...(values.CORS_ORIGINS ? values.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean) : [])
  ]
};
