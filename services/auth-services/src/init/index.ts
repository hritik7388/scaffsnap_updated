  
import logger from '../config/logger';
import prisma from '../config/prismaClient';

export const init = async (): Promise<void> => {
  try {
    logger.info('🚀 Starting initialization...');

    // ✅ DB
    await prisma.$connect();
    logger.info('✅ Database connected'); 

  } catch (error: any) {
    logger.error('❌ Init failed', { message: error.message });
    process.exit(1);
  }
};