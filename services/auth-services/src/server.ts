import app from './app';
import { init } from './init';
import logger from './config/logger';
import { setupGracefulShutdown } from '../../../packages/shutdown/shutdown';
import { createDefaultSuperAdmin } from '../src/init/default.superAdmin';
import '@packages/queue/worker'; 

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // ✅ infra init
    await init();

    // ✅ seed superadmin
    await createDefaultSuperAdmin(process.env.SUPERADMIN_EMAIL!);

    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
    });

    // ✅ graceful shutdown
    setupGracefulShutdown(server);

  } catch (error: any) {
    logger.error('❌ Server failed to start', {
      message: error.message,
    });
    process.exit(1);
  }
};

startServer();