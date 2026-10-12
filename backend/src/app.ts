import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import citizenRoutes from './routes/citizen.routes.js';
import evidenceRoutes from './routes/evidence.routes.js';
import policeRoutes from './routes/police.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { requestLogger } from './middleware/requestLogger.js';

// ────────────────────────────────────────────────
// Create Express application
// ────────────────────────────────────────────────

const app = express();
app.use(requestLogger);

// ─── Security ─────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowed = [
        env.CORS_ORIGIN,
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:3000',
      ];
      if (allowed.includes(origin) || env.isDevelopment) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  })
);

// ─── Rate Limiting ────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,                  // limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    errorCode: 'RATE_LIMIT_EXCEEDED',
  },
});
app.use('/api/', limiter);

// Dedicated rate limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
    errorCode: 'AUTH_RATE_LIMIT_EXCEEDED',
  },
});
app.use('/api/auth/', authLimiter);

// ─── Body Parsing ─────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Static File Serving ───────────────────────
app.use('/uploads', express.static(env.UPLOAD_DIR));

// ─── API Routes ───────────────────────────────
app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Civic Shield API',
    version: '1.0.0',
  });
});

app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/citizen', citizenRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/police', policeRoutes);
app.use('/api/admin', adminRoutes);

// ─── Error Handling ───────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
