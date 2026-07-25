import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  PORT: z.string().default('8080'),
  
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  SUPABASE_ANON_KEY: z.string(),
  DATABASE_URL: z.string(),
  
  REDIS_URL: z.string().default('redis://localhost:6379'),
  
  JWT_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_ACCESS_TTL_MOBILE: z.string().default('1h'),
  JWT_REFRESH_TTL: z.string().default('30d'),
  JWT_REFRESH_TTL_STAFF: z.string().default('8h'),
  OTP_TTL: z.string().default('300'),
  OTP_MAX_ATTEMPTS: z.string().default('5'),
  
  FLUTTERWAVE_SECRET_KEY: z.string().optional(),
  PAYSTACK_SECRET_KEY: z.string().optional(),
  ESCROW_AUTO_RELEASE_HOURS: z.string().default('48'),
  PLATFORM_COMMISSION_DEFAULT: z.string().default('10.0'),
  
  GOOGLE_MAPS_API_KEY: z.string().optional(),
  
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
  RATE_LIMIT_GENERAL: z.string().default('100'),
  RATE_LIMIT_OTP: z.string().default('5'),
  RATE_LIMIT_CHAT: z.string().default('30'),
  LOG_LEVEL: z.string().default('info'),
  SENTRY_DSN: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
