export const config = {
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  SERVICE_NAME: process.env.SERVICE_NAME || 'auth-service',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
};