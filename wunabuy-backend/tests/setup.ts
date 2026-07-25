// Jest setup file
process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = 'http://localhost:54321';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
process.env.SUPABASE_ANON_KEY = 'test-key';
process.env.DATABASE_URL = 'postgresql://localhost:5432/wunabuy_test';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.REDIS_URL = 'redis://localhost:6379';
