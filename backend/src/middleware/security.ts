import helmet from 'helmet';
import cors, { CorsOptions } from 'cors';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import csrf from 'csurf';
import rateLimit from 'express-rate-limit';

// Configure CORS - adjust origins as needed
const corsOriginsEnv = process.env.CORS_ORIGINS || 'http://localhost:3000';
const allowedOrigins = corsOriginsEnv === '*' 
  ? true // Allow all origins (for development/testing)
  : corsOriginsEnv.split(',').map(o => o.trim());

export const corsOptions: CorsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200, // Some legacy browsers (IE11) choke on 204
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
// We intentionally avoid strict typing here to prevent type conflicts between different
// express-serve-static-core versions in mono-repo installs.
export const csrfProtection =
  process.env.ENABLE_CSRF === 'true'
    ? csrf({ cookie: { httpOnly: true, sameSite: 'lax', secure: false } })
    : null;

// NOTE: We intentionally keep app untyped here to avoid cross-package
// express type conflicts in certain mono-repo / tooling setups.
export function applySecurity(app: any): void {
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
    app.use(csrfProtection as any);
  }

  // Global rate limiting
  app.use(globalLimiter);
}
