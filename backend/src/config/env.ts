import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGODB_URI: process.env.MONGODB_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback-secret-change-me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
  UPLOAD_DIR: path.resolve(__dirname, '../../', process.env.UPLOAD_DIR || 'uploads'),
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
} as const;

// Validate critical environment variables
function validateEnv(): void {
  const required = ['MONGODB_URI', 'JWT_SECRET'] as const;
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.warn(
      `⚠️  Missing environment variables: ${missing.join(', ')}. Using defaults for development.`
    );
  }
}

validateEnv();
