import app from './app.js';
import { env } from './config/env.js';
import connectDatabase from './config/database.js';
import { logger } from './utils/logger.js';
import pc from 'picocolors';
// ────────────────────────────────────────────────
// Start server
// ────────────────────────────────────────────────

// Initialize MongoDB connection
connectDatabase();

const server = app.listen(env.PORT, () => {
  const banner = `\n${pc.gray('============================================================')}
             ${pc.blue(pc.bold('CIVIC SHIELD BACKEND'))}
${pc.gray('============================================================')}
Environment : ${pc.cyan(env.NODE_ENV)}
Server      : ${pc.cyan('Express + TypeScript')}
Port        : ${pc.cyan(env.PORT)}
API Base    : ${pc.cyan('/api')}
Logging     : ${pc.green('ENABLED')}
${pc.gray('============================================================')}\n`;
  console.log(banner);
  console.log(`${pc.blue('[SERVER]')} API server running on port ${env.PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log(`${pc.blue('[SERVER]')} Shutdown signal received (SIGTERM)`);
  server.close(() => {
    console.log(`${pc.blue('[SERVER]')} Shutdown complete`);
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log(`\n${pc.blue('[SERVER]')} Shutdown signal received (SIGINT)`);
  server.close(() => {
    console.log(`${pc.blue('[SERVER]')} Shutdown complete`);
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

export default server;
