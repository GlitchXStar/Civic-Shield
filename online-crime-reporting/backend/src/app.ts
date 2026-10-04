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

// ────────────────────────────────────────────────
// Create Express application
// ────────────────────────────────────────────────

const app = express();

// ─── Security ─────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Rate Limiting ────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                   // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    errorCode: 'RATE_LIMIT_EXCEEDED',
  },
});
app.use('/api/', limiter);

// More aggressive rate limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
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

// ─── API Routes ───────────────────────────────
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Civic Shield API',
    version: '1.0.0'
  });
});
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/citizen', citizenRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/police', policeRoutes);
app.use('/api/admin', adminRoutes);

// Routes will be added in subsequent phases:
// app.use('/api/reports', reportRoutes);
// app.use('/api/evidence', evidenceRoutes);
// app.use('/api/notifications', notificationRoutes);

// ─── Error Handling ───────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
