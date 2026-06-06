import dotenv from 'dotenv';
// Load environment variables first
dotenv.config();

import app from './app';
import prisma from './config/database';

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`[Server] URDIGIX Solutions ERP API running on port ${PORT}`);
  console.log(`[Server] Environment: ${process.env.NODE_ENV}`);
});

// Handle graceful shutdown
const gracefulShutdown = async () => {
  console.log('[Server] Shutting down gracefully...');
  server.close(async () => {
    console.log('[Server] Express server closed.');
    await prisma.$disconnect();
    console.log('[Server] Prisma database connection disconnected.');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
