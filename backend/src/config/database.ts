import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';
export async function connectDatabase(): Promise<typeof mongoose> {
  try {
    const mongoUri = env.MONGODB_URI || 'mongodb://127.0.0.1:27017/civic_shield';
    const conn = await mongoose.connect(mongoUri);
    logger.db(`Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    logger.db('Connection error', { error: (error as Error).message });
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    logger.db('Connection closed gracefully.');
  } catch (error) {
    logger.db('Error disconnecting from MongoDB', { error: (error as Error).message });
  }
}
mongoose.connection.on('disconnected', () => {
  logger.db('Disconnected.');
});

mongoose.connection.on('error', (err) => {
  logger.db('Connection Error', { error: err.message });
});

export default connectDatabase;

