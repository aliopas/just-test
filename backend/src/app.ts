import express from 'express';
import { healthRouter } from './routes/health.routes';
import { authRouter } from './routes/auth.routes';
import { investorRouter } from './routes/investor.routes';
import { applySecurity, authLimiter } from './middleware/security';

const app = express();

// Security & core middleware
applySecurity(app);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route for Netlify
app.get('/', (_req, res) => {
  res.json({
    message: 'Bakurah Investors Portal API',
    version: '1.0.0',
    status: 'ok',
    endpoints: {
      health: '/api/v1/health',
      auth: '/api/v1/auth',
      investor: '/api/v1/investor',
    },
  });
});

// Routes
app.use('/api/v1/health', healthRouter);
app.use('/api/v1/auth', authLimiter, authRouter);
app.use('/api/v1/investor', investorRouter);

export default app;
