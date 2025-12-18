import express from 'express';
import { healthRouter } from './routes/health.routes';
import { authRouter } from './routes/auth.routes';
import { investorRouter } from './routes/investor.routes';
import { adminRouter } from './routes/admin.routes';
import { newsRouter } from './routes/news.routes';
import { notificationRouter } from './routes/notification.routes';
import { chatRouter } from './routes/chat.routes';
import { publicRouter } from './routes/public.routes';
import { applySecurity, authLimiter } from './middleware/security';

// NOTE: We deliberately annotate as `any` to avoid brittle cross-package
// Express type inference issues during backend-only builds. Runtime behavior
// is identical – this only relaxes TypeScript's view of the Express instance.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const app: any = express();

// Security & core middleware
applySecurity(app);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route for Netlify
app.get('/', (_req: express.Request, res: express.Response) => {
  res.json({
    message: 'Bakurah Investors Portal API',
    version: '1.0.0',
    status: 'ok',
    endpoints: {
      health: '/api/v1/health',
      auth: '/api/v1/auth',
      investor: '/api/v1/investor',
      admin: '/api/v1/admin',
      notifications: '/api/v1/notifications',
      news: '/api/v1/news',
      chat: '/api/v1/chat',
    },
  });
});

// Routes
// We relax typing here with `as any` to avoid brittle Express overload issues
// while keeping runtime behavior identical.
/* eslint-disable @typescript-eslint/no-explicit-any */
app.use('/api/v1/health', healthRouter as any);
app.use('/api/v1/auth', authLimiter as any, authRouter as any);
app.use('/api/v1/investor', investorRouter as any);
app.use('/api/v1/admin', adminRouter as any);
app.use('/api/v1/notifications', notificationRouter as any);
app.use('/api/v1/news', newsRouter as any);
app.use('/api/v1/chat', chatRouter as any);
app.use('/api/v1/public', publicRouter as any);
/* eslint-enable @typescript-eslint/no-explicit-any */

// Error handler middleware - must be last
// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use(((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // If response was already sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  // Log error for debugging
  console.error('[Error Handler]', {
    path: req.path,
    method: req.method,
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;

  // Return error response
  return res.status(statusCode).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'An unexpected error occurred',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
}) as any); // eslint-disable-line @typescript-eslint/no-explicit-any

// 404 handler - must be after all routes
app.use(((req: express.Request, res: express.Response) => {
  return res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
}) as any); // eslint-disable-line @typescript-eslint/no-explicit-any

export default app;
