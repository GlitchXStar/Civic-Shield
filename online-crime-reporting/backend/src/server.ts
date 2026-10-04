import app from './app.js';
import { env } from './config/env.js';
import connectDatabase from './config/database.js';

// ────────────────────────────────────────────────
// Start server
// ────────────────────────────────────────────────

// Initialize MongoDB connection
connectDatabase();

const server = app.listen(env.PORT, () => {
  console.log('');
  console.log('  ╔═══════════════════════════════════════════╗');
  console.log('  ║          CIVIC SHIELD BACKEND             ║');
  console.log('  ║    Online Crime Reporting System API      ║');
  console.log('  ╚═══════════════════════════════════════════╝');
  console.log('');
  console.log(`  ➜  Server:      http://localhost:${env.PORT}`);
  console.log(`  ➜  Health:      http://localhost:${env.PORT}/api/health`);
  console.log(`  ➜  Environment: ${env.NODE_ENV}`);
  console.log(`  ➜  CORS Origin: ${env.CORS_ORIGIN}`);
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received. Shutting down...');
  server.close(() => {
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
