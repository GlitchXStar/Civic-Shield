import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDatabase(): Promise<typeof mongoose> {
  try {
    const mongoUri = env.MONGODB_URI || 'mongodb://127.0.0.1:27017/civic_shield';
    const conn = await mongoose.connect(mongoUri);

    console.log(`🍃 MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    console.log('🔌 MongoDB connection closed gracefully.');
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error);
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected.');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB Connection Error:', err);
});

export default connectDatabase;

