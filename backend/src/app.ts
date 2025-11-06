import express from 'express';
import { healthRouter } from './routes/health.routes';
import { authRouter } from './routes/auth.routes';
import { applySecurity, authLimiter } from './middleware/security';

const app = express();

// Security & core middleware
applySecurity(app);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/health', healthRouter);
app.use('/api/v1/auth', authLimiter, authRouter);

export default app;
