import { Server } from 'node:http';
import logger from '../../services/auth-services/src/config/logger'; 
import prisma from '../../services/auth-services/src/config/prismaClient';
 // ✅ correct import

let isShuttingDown = false;

export const setupGracefulShutdown = (server: Server) => {
  const shutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info(`Received ${signal}. Starting graceful shutdown...`);

    const forceTimeout = setTimeout(() => {
      logger.error('Shutdown timeout reached. Forcing exit.');
      process.exit(1);
    }, 15000);

    try {
      // ✅ Close HTTP server
      await new Promise<void>((resolve) => {
        server.close(() => {
          logger.info('HTTP server closed');
          resolve();
        });
      });

      // ✅ Prisma disconnect
      await prisma.$disconnect();
      logger.info('Database connection closed');

     

      clearTimeout(forceTimeout);

      logger.info('Graceful shutdown completed\n--------------------------------');
      process.exit(0);
    } catch (error: any) {
      logger.error('Error during graceful shutdown', {
        message: error.message,
        stack: error.stack,
      });

      process.exit(1);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception', {
      message: error.message,
      stack: error.stack,
    });
    shutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason: any) => {
    logger.error('Unhandled Rejection', { reason });
    shutdown('unhandledRejection');
  });
};