import helmet from 'helmet';
import cors, { CorsOptions } from 'cors';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import csrf from 'csurf';
import rateLimit from 'express-rate-limit';
import { Express, RequestHandler } from 'express';

// Configure CORS - adjust origins as needed
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map(o => o.trim());

export const corsOptions: CorsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Global rate limiter (e.g., 200 req/15min per IP)
export const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth-specific stricter limiter (e.g., 10 req/min)
export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

// Optional CSRF protection (for cookie-based flows). Disabled by default for pure API/JWT.
export const csrfProtection: RequestHandler | null =
  process.env.ENABLE_CSRF === 'true'
    ? csrf({ cookie: { httpOnly: true, sameSite: 'lax', secure: false } })
    : null;

export function applySecurity(app: Express): void {
  // Security headers + CSP
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'default-src': ["'self'"],
          'img-src': ["'self'", 'data:'],
          'script-src': ["'self'"],
          'style-src': ["'self'", "'unsafe-inline'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );

  // HTTP Parameter Pollution protection
  app.use(hpp());

  // CORS
  app.use(cors(corsOptions));

  // Cookies (for CSRF if enabled)
  app.use(cookieParser());

  if (csrfProtection) {
    app.use(csrfProtection);
  }

  // Global rate limiting
  app.use(globalLimiter);
}
